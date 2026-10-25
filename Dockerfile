# Stage 1: Build the Spring Boot backend using Maven wrapper and Java 17
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /workspace

# Copy Maven wrapper and pom.xml first for efficient dependency layer caching
COPY backend/.mvn ./backend/.mvn
COPY backend/mvnw ./backend/mvnw
COPY backend/pom.xml ./backend/pom.xml

# Ensure Unix line endings and executable permission for Maven wrapper on Linux
RUN sed -i 's/\r$//' ./backend/mvnw && chmod +x ./backend/mvnw

# Switch to backend directory and pre-fetch project dependencies
WORKDIR /workspace/backend
RUN ./mvnw dependency:go-offline -B || true

# Copy backend source code
COPY backend/src ./src

# Build production JAR (skip tests during container build; automated tests run separately)
RUN ./mvnw clean package -DskipTests -B && \
    cp $(find target -maxdepth 1 -name "*.jar" ! -name "*original*" ! -name "*-sources.jar" | head -n 1) app.jar

# Stage 2: Minimal, secure production runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create a non-root system user and group for security
RUN groupadd -r nestly && useradd -r -g nestly -s /bin/false nestly

# Copy the compiled JAR artifact from the builder stage
COPY --from=builder --chown=nestly:nestly /workspace/backend/app.jar app.jar

# Render supplies PORT via environment variable (default fallback 8080)
ENV PORT=8080
EXPOSE ${PORT}

USER nestly

# Production JVM options: container-aware heap sizing, entropy source optimization
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
