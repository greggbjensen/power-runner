@echo off
setlocal
set npm_config_target=6.1.6
set npm_config_arch=x64
set npm_config_target_arch=x64
set npm_config_disturl="https://atom.io/download/electron"
set npm_config_runtime="electron"
set npm_config_build_from_source=true
set npm_config_cache=~\.npm-electron
npm i
endlocal
