i18n.mergeResourceBundle('ru', 'translation', {
    core: {
        demo_mode: 'Демо режим',
        status: {
            start0: 'Начинаем выполнение задач',
            start: 'Выполняются задачи',
            message: 'Выполняется задача №%s...'
        },
        messages: {
            error0: 'Убедитесь что указан правильный тип сигнала (аналоговый/цифровой)',
            error1: 'Обнаружена внутренняя ошибка. Для повышения качества обработки файла свяжитесь пожалуйста с производителем',
            warning2: 'Неудалось найти часть данных для сравнения. Возможно изменился формат данных',
            hint2: 'Попробуйте "перезапустить" сравниваемый файл с данной версией скрипта',
            warning3: 'Обнаружено несоответствие форматов данных между данной версией скрипта и той что была использована для внешнего файла',
            hint3: 'Нужно "перезапустить" сравниваемый файл с данной версией скрипта'
        }
    },

    report: {
        version: {
            dev: 'Скрипт %s. Версия для разработчиков от %s',
            rel: 'Скрипт %s. Версия %s',
            vcs_dev: '%s скрипт. Версия для разработчиков от %s. Идентификатор сборки: %s'
        },
        date: 'Время запуска: %s',
        done: 'Готово! Время обработки: %s',

        messages: {
            bug: '\tПрограмные ошибки',
            error: '\tОшибки',
            hint: '\tСоветы',
            message: '\tИтоги',
            warning: '\tУведомления'
        }
    },

    inputs: {
        combo: {
            'auto': 'авто',
            'custom': 'другие',
            'default': 'по умолчанию',
            'manual': 'ручные',
            'nothing': '---',
            'no': 'нет',
            'yes': 'да'
        }
    },

    units: {
        angle: '°',
        'arb-u': 'ед.',
        kg: 'кг',
        min: 'мин',
        ms: 'мсек',
        none: '',
        prc: '%',
        q: 'кол-во',
        rpm: 'об/мин',
        s: 'сек',
        space: '\u0020',
        volt: 'В'
    },

    signal: {
        dt: "dT",
        dt_value: "Значение $t(signal.dt) при поиске фронта: %d",
        dv: "dV",
        dv_value: "Значение $t(signal.dv) при поиске фронта: %s",
        type: "Тип сигнала: %s",
        holl: "Холла",
        induct: "Индуктивный",
        level1: "Уровень для поиска фронта типа $t(signal.front.grow): %f",
        level2: "Уровень для поиска фронта типа $t(signal.front.fall): %f",
        front_value: "Фронт для поиска: %s",
        front: {
            grow: 'рост',
            fall: 'спад',
            any: 'любой'
        }
    },

    specs: {
        none: {
            name: ''
        },
        time: {
            name: 'Время'
        }
    }
});

