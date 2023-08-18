#!/bin/bash



# файл сборки
CSS_FILE_NAME=kolos.css
# каталог сборки css
CSS_DIR_BUILD=./..
# каталог пользовательских css скрипов
CSS_DIR_CUSTOM=./../custom-css

# файл сборки
JS_FILE_NAME=kolos.js
# каталог сборки
JS_DIR_BUILD=./..
# каталог пользовательских компонентов
JS_DIR_CUSTOM_ROOT=./..
JS_DIR_CUSTOM_DIRS=( "custom" "page" )
JS_DIR_APP="app"

#-- Сборка css ---------------------->>


mkdir -p $CSS_DIR_BUILD

# собираем общие скрипы css
find ./css/source -name "*.css" | sort | xargs cat > "$CSS_DIR_BUILD/$CSS_FILE_NAME"

# собираем пользовательские скрипты css
mkdir -p $CSS_DIR_CUSTOM
find $CSS_DIR_CUSTOM -name "*.css" | sort | xargs cat >> "$CSS_DIR_BUILD/$CSS_FILE_NAME"

cp -R -f ./css/fonts "$CSS_DIR_BUILD/fonts"


#-- Сборка js ---------------------->>

# пример приложения

if [ ! -f "$JS_DIR_CUSTOM_ROOT/$JS_DIR_APP/custom.js" ]
then
  mkdir -p "$JS_DIR_CUSTOM_ROOT/$JS_DIR_APP"
  touch "$JS_DIR_CUSTOM_ROOT/$JS_DIR_APP/custom.js"
  echo -e "kolos.app.custom = {\n}\n" >> "$JS_DIR_CUSTOM_ROOT/$JS_DIR_APP/custom.js"
fi



touch "$JS_DIR_BUILD/$JS_FILE_NAME"
cat ./lib/jquery_and_json_1_9.js >> "$JS_DIR_BUILD/$JS_FILE_NAME"
echo -e "\n" >> "$JS_DIR_BUILD/$JS_FILE_NAME"
cat ./base.js >> "$JS_DIR_BUILD/$JS_FILE_NAME"
find ./core -name "*.js" | sort | xargs cat >> "$JS_DIR_BUILD/$JS_FILE_NAME"
find ./system -name "*.js" | sort | xargs cat >> "$JS_DIR_BUILD/$JS_FILE_NAME"
cat ./Kolos.js >> "$JS_DIR_BUILD/$JS_FILE_NAME"
cat ./app.js >> "$JS_DIR_BUILD/$JS_FILE_NAME"

# добавляем пользовательское приложение
cat "$JS_DIR_CUSTOM_ROOT/$JS_DIR_APP/custom.js" >> "$JS_DIR_BUILD/$JS_FILE_NAME"


# добавляем пользовательские скрипты
for dirName in "${JS_DIR_CUSTOM_DIRS[@]}"; do
  mkdir -p "$JS_DIR_CUSTOM_ROOT/$dirName"
  # find "$JS_DIR_CUSTOM_ROOT/$dirName" -name "*.js" | sort | xargs cat >> "$JS_DIR_BUILD/$JS_FILE_NAME"
done

