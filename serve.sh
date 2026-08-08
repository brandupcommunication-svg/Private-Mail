#!/bin/bash
# Sert la maquette en statique. Le port vient de $PORT si défini, sinon 4710.
cd "$(dirname "$0")" || exit 1
exec python3 -m http.server "${PORT:-4710}"
