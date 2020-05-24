#!/usr/bin/env bash

# Local Server
run_server() {
  if [[ "$OSTYPE" == "linux-gnu" ]]; then
    open https://localhost
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    open https://localhost
    echo "navigate to https://$(ifconfig en0 | grep 'inet ' | sed 's/.*inet //;s/ netmask.*//') on another locally networked PC"
  else
    echo "Navigate to https://localhost in your browser"
  fi
  echo ""

  which serve &> /dev/null
  if [ $? -eq 0 ]; then
    serve .
  else
    echo "Install https-localhost -- (npm i -g --only=prod https-localhost) -- https://github.com/daquinoaldo/https-localhost"
  fi
}

# Preview README
preview() {
  which grip &> /dev/null

  if [ $? -eq 0 ]; then
    open http://localhost:6419
    grip
  else
    echo "Install grip: https://github.com/joeyespo/grip"
  fi
}

# Package
package() {
  cd ./build
  build_name=build_$(date +%s).zip
  zip -r $build_name ./*
  mv $build_name ../builds/
  cd ../
  echo "Build located at $(pwd)/builds/$build_name"
}

# Build
build() {
  rsync -avr --exclude='node_modules/' --exclude='*.zip' --exclude='dist/' --exclude='.cache/' --exclude='node_modules/' --exclude='.git*' --exclude='build/' --exclude='builds/' --exclude='.eslintrc.js' --exclude='tools.sh' --exclude='hidden/' ./ ./build/

  package
}

while getopts “sbr” opt; do
  case $opt in
    s ) run_server
    ;;
    b ) build
    ;;
    r ) preview
    ;;
  esac
done
