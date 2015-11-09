#!/bin/bash
# usage: ./oe_images.sh /path/to/source/image.jpg /path/to/target/image_name_with_no_extension
# * make sure script is executable (chmod +x) *

/usr/bin/convert "${1}" -quality 80 -thumbnail 180x180^ -gravity center -extent 180x180 -unsharp 1.5x1+0.7+0.02 "${2}.180.jpg"
/usr/bin/jpegtran -progressive -outfile "${2}.180.jpg" "${2}.180.jpg"
/usr/bin/convert "${1}" -quality 80 -thumbnail 360x360^ -gravity center -extent 360x360 -unsharp 1.5x1+0.7+0.02 "${2}.360.jpg"
/usr/bin/jpegtran -progressive -outfile "${2}.360.jpg" "${2}.360.jpg"
/usr/bin/convert "${1}" -quality 80 -resize 1000x1000^ -gravity center -extent 1000x1000 "${2}.1000.jpg"
/usr/bin/jpegtran -progressive -outfile "${2}.1000.jpg" "${2}.1000.jpg"