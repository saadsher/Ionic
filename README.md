Spasey

run: ionic serve

build -iOS:         ionic add platform ios
                    ionic build ios
                    ionic emulate ios

build --Android:    ionic add platform android
                    ionic build android
                    ionic emulate android