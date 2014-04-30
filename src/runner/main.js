if (Host.DataType === ('$DATATYPE$'.indexOf('$') > -1 ? '$DATATYPE$' : 'ANA')) {
    // function that does all the magic
    Dispatcher.process();
} else {
    _rp(_t('core.error0'));
}
