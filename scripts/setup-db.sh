#!/bin/bash
# Migration script for MemorialCare database setup

echo "Setting up MemorialCare database..."

# Install Prisma if not already installed
pnpm add -D prisma @prisma/client

# Run migrations
pnpm exec prisma migrate dev --name init

echo "Database setup complete!"
