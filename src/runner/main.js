if (Host.DataType === ('$DATATYPE$'.indexOf('$') > -1 ? 'ANA' : '$DATATYPE$')) {
    // function that does all the magic
    Dispatcher.process();
} else {
    _rp(_t('core.error0'));
}
