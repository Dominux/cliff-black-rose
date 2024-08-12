download:
	wget -O ./lib/babylon.dynamicTerrain.min.js https://raw.githubusercontent.com/BabylonJS/Extensions/master/DynamicTerrain/dist/babylon.dynamicTerrain.min.js
	wget -O ./lib/perlin.js https://raw.githubusercontent.com/josephg/noisejs/master/perlin.js

run_server:
	python3 -m http.server
