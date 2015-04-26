i18n.mergeResourceBundle('ru', 'translation', {
    core: {
        demo_mode: 'Демо режим',
        status: {
            start0: 'Начинаем выполнение задач',
            start: 'Выполняются задачи',
            message: 'Выполняется задача №%s...'
        },
        messages: {
            'loadData': {
                'error1': 'Сравниваемый файл не найден',
                'error2': 'Не удалось прочитать файл',
                'error3': '"JSON.parse()" operation failed',
                'error4': 'Data file misses "data" section'
            },

            'pullData': {
                'error1': 'data4Compare is null',
                'error2': 'data4Compare\'s "data" prop is not a hash/Object',
                'error3': 'Не удалось найти часть данных для сравнения. Возможно изменился формат данных',
                'hint3':  'Попробуйте "перезапустить" сравниваемый файл с данной версией скрипта',
                'error4': 'spes\'s section of data4Compare\'s "data" prop is not an array'
            },

            error0: 'Убедитесь, что указан правильный тип сигнала (аналоговый/цифровой).',
            error1: 'Обнаружена внутренняя ошибка. Для ёё устранения свяжитесь пожалуйста с производителем.'
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
        'stop_after': {
            'name': 'Остановить после задачи'
        },
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

