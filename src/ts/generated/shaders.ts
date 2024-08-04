/* tslint:disable */

export const basicShader = `// VERTEX
attribute vec2 position;
attribute vec2 texcoords;
uniform mat4 transform;
varying vec2 textureCoord;
void main() {
	textureCoord = texcoords;
	gl_Position = transform * vec4(position, 0, 1);
}
// FRAGMENT
precision mediump float;
uniform sampler2D sampler1;
varying vec2 textureCoord;
void main() {
	gl_FragColor = texture2D(sampler1, textureCoord);
}`;

export const lightShader = `// VERTEX
attribute vec2 position;
attribute vec2 texcoords;
attribute vec4 vertexColor;
uniform mat4 transform;
uniform vec4 lighting;
varying vec2 textureCoord;
varying vec4 vColor;
void main() {
	textureCoord = texcoords;
	vColor = vertexColor * lighting;
	gl_Position = transform * vec4(position, 0, 1);
}
// FRAGMENT
precision mediump float;
varying vec2 textureCoord;
varying vec4 vColor;
void main() {
	float d = clamp(1.1 - length(textureCoord), 0.0, 1.0);
	float m = d * d; // * d;
	gl_FragColor = vec4(m, m, m, 1) * vColor;
}`;

export const mergeShader = `// VERTEX
attribute vec2 position;
attribute vec2 texcoords;
uniform mat4 transform;
uniform vec2 textureSize;
varying vec2 textureCoord;
void main() {
	textureCoord = texcoords / textureSize;
	gl_Position = transform * vec4(position, 0, 1);
}
// FRAGMENT
precision mediump float;
uniform sampler2D sampler1;
uniform sampler2D sampler2;
varying vec2 textureCoord;
void main() {
		vec3 color1 = texture2D(sampler1, textureCoord).rgb;
		vec3 color2 = texture2D(sampler2, textureCoord).rgb;
	gl_FragColor = vec4(color1 * color2, 1.0);
}`;

export const paletteDepthShader = `// VERTEX
attribute vec3 position;
attribute vec4 texcoords;
attribute vec4 vertexColor;
uniform mat4 transform;
uniform vec4 lighting;
varying vec4 textureCoord;
varying vec4 vColor;
void main() {
	textureCoord = texcoords;
	vColor = vertexColor * lighting;
	gl_Position = transform * vec4(position, 1);
}
// FRAGMENT
precision mediump float;
uniform sampler2D sampler1; // sprite
uniform sampler2D sampler2; // palette
uniform float pixelSize;
varying vec4 textureCoord;
varying vec4 vColor;
void main() {
	vec4 sprite = texture2D(sampler1, vec2(textureCoord.x, textureCoord.y));
	vec4 palette = texture2D(sampler2, vec2(textureCoord.z + sprite.x * pixelSize, textureCoord.w));
	vec4 color = vec4(palette.xyz * sprite.y, palette.w) * vColor;
	gl_FragColor = color;
	if (color.a < 0.01)
		discard;
}`;

export const paletteLayersInstancedShader = `// VERTEX
attribute vec2 position0;
attribute vec4 position1;
attribute vec4 texcoord0;
attribute vec2 texcoord1;
attribute vec4 vertexColor;
attribute vec4 vertexColor1;
uniform mat4 transform;
uniform vec4 lighting;
varying vec2 textureCoord0;
varying vec2 textureCoord1;
varying vec4 vColor;
varying vec4 vColor1;
void main() {
	textureCoord0 = vec2(texcoord0.x + position0.x * texcoord0.z, texcoord0.y + position0.y * texcoord0.w);
	textureCoord1 = texcoord1;
	vColor = vertexColor * lighting;
	vColor1 = vertexColor1;
	gl_Position = transform * vec4(
		position1.x + position0.x * position1.z, position1.y + position0.y * position1.w, 0, 1);
}
// FRAGMENT
precision mediump float;
uniform sampler2D sampler1; // sprite
uniform sampler2D sampler2; // palette
uniform float pixelSize;
varying vec2 textureCoord0;
varying vec2 textureCoord1;
varying vec4 vColor;
varying vec4 vColor1;
void main() {
	vec4 sprite = texture2D(sampler1, textureCoord0.xy);
	float shade = clamp(sprite.g + vColor1.a, 0.0, 1.0);
	vec4 mask = vec4(vColor1.rgb, 1.0 - (vColor1.r + vColor1.g + vColor1.b));
	float paletteIndex = dot(mask, sprite);
	vec4 palette = texture2D(sampler2, vec2(textureCoord1.x + paletteIndex * pixelSize, textureCoord1.y));
	gl_FragColor = vec4(palette.xyz * shade, palette.w) * vColor;
}`;

export const paletteLayersShader = `// VERTEX
attribute vec3 position;
attribute vec4 texcoords;
attribute vec4 vertexColor;
attribute vec4 vertexColor1;
uniform mat4 transform;
uniform vec4 lighting;
uniform float textureSize;
varying vec4 textureCoord;
varying vec4 vColor;
varying vec4 vColor1;
void main() {
	textureCoord = vec4(texcoords.xy * textureSize, texcoords.zw);
	// float f = texcoords.z;
	// float fr = fract(texcoords.z);
	// textureCoord.z = fr;
	// textureCoord.w = (f - fr) / 1024.0;
	vColor = vertexColor * lighting;
	vColor1 = vertexColor1;
	float depth = position.z;
	#ifdef DEPTH_BUFFERED
		if (depth < 0.0) {
			depth = -depth;
		}
		else if (vColor.a < 0.975) {
			depth = 0.0;
		}
	#endif
	gl_Position = transform * vec4(position.xy, depth, 1);
}
// FRAGMENT
precision mediump float;
uniform sampler2D sampler1; // sprite
uniform sampler2D sampler2; // palette
uniform float pixelSize;
varying vec4 textureCoord;
varying vec4 vColor;
varying vec4 vColor1;
void main() {
	vec4 sprite = texture2D(sampler1, textureCoord.xy);
	float shade = clamp(sprite.g + vColor1.a, 0.0, 1.0);
	vec4 mask = vec4(vColor1.rgb, 1.0 - (vColor1.r + vColor1.g + vColor1.b));
	float paletteIndex = dot(mask, sprite);
	vec2 paletteCoord = textureCoord.zw;
	vec4 palette = texture2D(sampler2, vec2(paletteCoord.x + paletteIndex * pixelSize, paletteCoord.y));
	gl_FragColor = vec4(palette.xyz * shade, palette.w) * vColor;
	#ifdef DEPTH_BUFFERED
		if (gl_FragColor.a < 0.01) {
			discard;
		}
	#endif
}`;

export const paletteShader = `// VERTEX
attribute vec2 position;
attribute vec4 texcoords;
attribute vec4 vertexColor;
uniform mat4 transform;
uniform vec4 lighting;
varying vec4 textureCoord;
varying vec4 vColor;
void main() {
	textureCoord = texcoords;
	vColor = vertexColor * lighting;
	gl_Position = transform * vec4(position, 0, 1);
}
// FRAGMENT
precision mediump float;
uniform sampler2D sampler1; // sprite
uniform sampler2D sampler2; // palette
uniform float pixelSize;
varying vec4 textureCoord;
varying vec4 vColor;
void main() {
	vec4 sprite = texture2D(sampler1, vec2(textureCoord.x, textureCoord.y));
	vec4 palette = texture2D(sampler2, vec2(textureCoord.z + sprite.x * pixelSize, textureCoord.w));
	gl_FragColor = vec4(palette.xyz * sprite.y, palette.w) * vColor;
}`;

export const spriteShader = `// VERTEX
attribute vec3 position;
attribute vec2 texcoords;
attribute vec4 vertexColor;
uniform mat4 transform;
uniform vec4 lighting;
uniform vec2 textureSize;
varying vec2 textureCoord;
varying vec4 vColor;
void main() {
	textureCoord = texcoords / textureSize;
	vColor = vertexColor * lighting;
	gl_Position = transform * vec4(position, 1);
}
// FRAGMENT
precision mediump float;
uniform sampler2D sampler1;
varying vec2 textureCoord;
varying vec4 vColor;
void main() {
	gl_FragColor = texture2D(sampler1, textureCoord);
	#ifdef USE_COLOR
		gl_FragColor *= vColor;
	#endif
}`;

export const sprite2Shader = `// VERTEX
attribute vec3 position;
attribute vec2 texcoords;
attribute vec4 vertexColor;
uniform mat4 transform;
varying vec2 textureCoord;
varying vec4 vColor;
void main() {
	textureCoord = texcoords;
	vColor = vertexColor;
	gl_Position = transform * vec4(position, 1);
}
// FRAGMENT
precision mediump float;
uniform sampler2D sampler1;
varying vec2 textureCoord;
varying vec4 vColor;
void main() {
	gl_FragColor = texture2D(sampler1, textureCoord) * vColor;
}`;
