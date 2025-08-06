---
layout: post
title: 'Git: история в консоли'
description: Настройка команд для просмотра истории коммитов.
metadata: Настройка команд для удобного просмотра истории Git в консоли
keywords:
    - консоль
    - история
    - git
    - console
    - cli
    - history
    - log
    - branch
    - commit
tags:
    - git
    - кодинг
---
Так уж получилось, что уже давно пользуюсь дополнительной командой `git lg` для
просмотра истории коммитов из консоли. Напишу сюда, как это дело настраивается,
и вообще для чего это нужно.

Обычно, для просмотра истории можно использовать команду `git log` с параметрами.
Без параметров её вывод выглядит как-то так:

    commit 048ae5b4b0f90db4b9fc1d7088108294d145a652
    Author: Aleksandr Chermenin <aleksandr_chermenin@epam.com>
    Date:   Fri Feb 9 09:37:07 2018 +0300

        Some style fixes

    commit badc12b24be4f532391ca988f6f1e989e97588c9
    Merge: 10df314 36f5df4
    Author: Aleksandr Chermenin <aleksandr_chermenin@epam.com>
    Date:   Fri Feb 9 09:22:16 2018 +0300

        Merge branch 'master' of https://github.com/chermenin/chermenin.ru

    ...

Согласитесь, не очень красиво, да и не особо понятно. Можно помнить все параметры
этой команды, а можно добавить пару "алиасов", для чего добавить следующие строки
в файл `~/.gitconfig`:

    [alias]
    	lg1 = log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(bold yellow)%d%C(reset)' --all
    	lg2 = log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n'' %C(white)%s%C(reset) %C(dim white)- %an%C(reset)' --all
    	lg = !"git lg1"

Запуск `git lg1` или просто `git lg` выводит следующий результат:

    * 048ae5b - (3 hours ago) Some style fixes - Aleksandr Chermenin (HEAD -> master, origin/master, origin/HEAD)
    *   badc12b - (4 hours ago) Merge branch 'master' of https://github.com/chermenin/chermenin.ru - Aleksandr Chermenin
    |\
    | * 36f5df4 - (4 hours ago) Update .travis.yml - Alex Chermenin
    * | 10df314 - (4 hours ago) Added styles for LinkedIn badge - Aleksandr Chermenin
    |/
    * 75eeea4 - (19 hours ago) Updated LinkedIn badge - Aleksandr Chermenin
    * b5e07a5 - (2 months ago) Some updates - Aleksandr Chermenin
    * 22cf2c6 - (3 months ago) Update cv.html - Alex Chermenin
    * bc8481d - (3 months ago) Updated some information - Aleksandr Chermenin
    ...

Команда `git lg2` выводит дерево, отводя по две строки на каждый коммит:

    * 048ae5b - Fri, 9 Feb 2018 09:37:07 +0300 (3 hours ago) (HEAD -> master, origin/master, origin/HEAD)
    |  Some style fixes - Aleksandr Chermenin
    *   badc12b - Fri, 9 Feb 2018 09:22:16 +0300 (4 hours ago)
    |\   Merge branch 'master' of https://github.com/chermenin/chermenin.ru - Aleksandr Chermenin
    | * 36f5df4 - Fri, 9 Feb 2018 09:17:06 +0300 (4 hours ago)
    | |  Update .travis.yml - Alex Chermenin
    * | 10df314 - Fri, 9 Feb 2018 09:21:57 +0300 (4 hours ago)
    |/   Added styles for LinkedIn badge - Aleksandr Chermenin
    * 75eeea4 - Thu, 8 Feb 2018 17:31:45 +0300 (20 hours ago)
    |  Updated LinkedIn badge - Aleksandr Chermenin
    * b5e07a5 - Thu, 30 Nov 2017 12:18:59 +0300 (2 months ago)
    |  Some updates - Aleksandr Chermenin
    * 22cf2c6 - Wed, 15 Nov 2017 13:00:16 +0300 (3 months ago)
    |  Update cv.html - Alex Chermenin
    * bc8481d - Tue, 31 Oct 2017 14:27:27 +0300 (3 months ago)
    |  Updated some information - Aleksandr Chermenin
    ...

В результате дошло до того, что уже несколько лет не пользуюсь никакими "гуями"
и всё что нужно делаю из консоли.

И да, обязательно поставьте плюсик Слиппу Томпсону, по чьему совету я это
когда-то сделал: https://stackoverflow.com/a/9074343
