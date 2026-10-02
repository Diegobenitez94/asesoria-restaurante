#!/bin/bash
cd /home/diego/asesoria-restaurante

echo "Servidor corriendo en http://localhost:8001"
exec python3 -m http.server 8001
