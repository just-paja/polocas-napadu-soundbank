files=$(ls)

for dir in $files; do
  if [ -d $dir ]; then
    manifest="$dir/manifest.json"

    if [ ! -f $manifest ]; then
      echo Generating manifest for $dir
      sounds=($(ls $dir))
      pos=$(( ${#sounds[*]} - 1 ))
      last=${sounds[$pos]}

      echo "{" > $manifest
      echo "  \"name\": \"$dir\"," >> $manifest
      echo "  \"sounds\": [" >> $manifest
      for sound in ${sounds[@]}; do
        echo "    {" >> $manifest
        echo "      \"file\": \"${sound}\"," >> $manifest
        echo "      \"tags\": [\"${dir}\"]" >> $manifest
        if [[ $sound == $last ]]; then
          echo "    }" >> $manifest
        else
          echo "    }," >> $manifest
        fi
      done
      echo "  ]" >> $manifest
      echo "}" >> $manifest
    fi
  fi
done
