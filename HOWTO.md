## Požadavky

* Potřebuješ počítač
* Potřebuješ přístup k internetu
* Potřebuješ účet na githubu
* Můžeš to dělat
  * buď v nějakým textovým editoru co ti zvýrazňuje syntaxi = jednodušší pro mě, složitější pro tebe
  * nebo přímo na webu = budu po tobě opravovat chyby

## Cíl práce

Na Githubu máme rozepsanou definici hudební banky, kterou bude konzumovat appka na které pracuju. Na nejvyšší úrovni jsou zvukové moduly. Potřebujeme každý zvuk popsat za pomoci tagů, tak aby bylo co nejjednodušší za pomoci lidské asociace daný zvuk najít. Například "Hmm, hodil by se mi zvuk brokovnice" asociuju: {zbraň, brokovnice, nabíjení, výstřel, střelba} a mám pět tagů pod kterými bych daný zvuk mohl hledat.

https://github.com/just-paja/polocas-napadu-soundbank


## Moduly

* zvukový modul popisuje zvukové soubory
* zvukový modul definuje tagy (značky)
* každý modul musí obsahovat soubor manifest.json
* každý modul by měl být co nejmenší, ideální počet zvuků je 5 - 10
* moduly jsou stromová struktura - každý modul může obsahovat moduly
* každý modul může mít základní tag (baseTag), který se přiřadí všem zvukům (viz modul genre-scifi). Není potřeba proto u všech zvuků opakovat tag #genre, ani #scifi. Basetagy se dají vrstvit.


## Tagy

* každý tag má svoje jedinečné jméno napsané v angličtině bez diakritiky camelCase
* každý tag má nekonečně překladů jména do různých jazyků
* všechny tagy jsou si rovny


## Soubory

Soubory se zvuky nejsou z technických důvodů ve stejném repozitáři jako definice zvukové banky. Chcete-li najít zvuk, který je popsaný v definici modulu, postupujte následovně:

1. Otevřete si definici modulu

```
https://github.com/just-paja/polocas-napadu-soundbank/blob/master/machines/manifest.json
```

2. Zkopírujte si název souboru zvuku

```
Vybírám si ten první: "servo_motor_psef.260.mp3"
```

3. Napište do prohlížeče URL podle schématu `http://soundbank.polocas-napadu.cz/{cesta-k-modulu}/{zvukovy-soubor}`

```
Píšu http://soundbank.polocas-napadu.cz/machines/servo_motor_psef.260.mp3
```
