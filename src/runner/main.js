if (Host.DataType === (typeof $DATATYPE$ === 'undefined' ? 'ANA' : $DATATYPE$)) {
    // function that does all the magic
    Dispatcher.process();
} else {
    _rp(_t('core.error0'));
}
