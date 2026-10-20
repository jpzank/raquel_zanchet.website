#!/bin/sh
# Põe som nos filmes renderizados mudos em mudo/ e grava o resultado em ../videos.
#
# O som é do próprio Jardim da Amazônia, tirado do acervo (ver README):
#   cama   ambiente da margem do rio Claro, filtrado do grave do vento e do
#          chiado, emendado nele mesmo para cobrir o filme inteiro
#   canto  o tiê-bicudo do registro de Jhonata Araujo, de 1s a 6,5s do clipe,
#          sem o grave, entrando quando a ave aparece ou quando o logo assina
set -e
cd "$(dirname "$0")"
A=acervo

# cama: dois passes do ambiente, cruzados em 3s, cerca de 45s no total
ffmpeg -y -loglevel error -i $A/rio-claro.mp4 -i $A/rio-claro.mp4 -filter_complex \
  "[0:a][1:a]acrossfade=d=3,highpass=f=140,lowpass=f=9000,loudnorm=I=-27:TP=-4:LRA=7[a]" \
  -map "[a]" -ar 48000 -ac 2 /tmp/jda-cama.wav
ffmpeg -y -loglevel error -ss 1.0 -t 5.5 -i $A/tie-bicudo-jhonata-araujo.mp4 -af \
  "highpass=f=1200,lowpass=f=7500,afftdn=nr=18:nf=-40,afade=t=in:d=0.9,afade=t=out:st=4.4:d=1.1,loudnorm=I=-17:TP=-2:LRA=5" \
  -ar 48000 -ac 2 /tmp/jda-canto.wav

# mix filme duração_s início_do_canto_s|- volume_da_cama
mix() {
  if [ "$3" = "-" ]; then
    ffmpeg -y -loglevel error -i mudo/$1.mp4 -i /tmp/jda-cama.wav -filter_complex \
      "[1:a]atrim=0:$2,volume=$4,afade=t=in:d=2.5,afade=t=out:st=$(echo "$2 - 2.5" | bc):d=2.5[a]" \
      -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 160k -t $2 -movflags +faststart ../videos/$1.mp4
  else
    ms=$(echo "$3 * 1000 / 1" | bc)
    ffmpeg -y -loglevel error -i mudo/$1.mp4 -i /tmp/jda-cama.wav -i /tmp/jda-canto.wav -filter_complex \
      "[1:a]atrim=0:$2,volume=$4,afade=t=in:d=2.5,afade=t=out:st=$(echo "$2 - 2.5" | bc):d=2.5[c];[2:a]adelay=${ms}|${ms}[t];[c][t]amix=inputs=2:normalize=0:duration=first[a]" \
      -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 160k -t $2 -movflags +faststart ../videos/$1.mp4
  fi
  echo "ok $1"
}

mix 1-por-um-fio 31 25.0 1.0
mix 2-trinta-anos 27 19.0 1.0
mix 4-quarto-prototipo 19 - 0.6
