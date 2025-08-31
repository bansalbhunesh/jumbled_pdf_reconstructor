#!/bin/bash

echo "Setting up PDF Reconstructor..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install web dependencies
echo "Installing web dependencies..."
cd web
npm install
cd ..

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p uploads runs .tmp .cache/transformers

echo ""
echo "Setup complete! Run ./start.sh to start the services."
