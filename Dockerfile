# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["DevKeep.Api/DevKeep.Api.csproj", "DevKeep.Api/"]
RUN dotnet restore "DevKeep.Api/DevKeep.Api.csproj"

# Copy remaining source code and publish
COPY . .
WORKDIR "/src/DevKeep.Api"
RUN dotnet publish "DevKeep.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Final Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Configure dynamic listening port 8080 for Render / Podman
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "DevKeep.Api.dll"]
