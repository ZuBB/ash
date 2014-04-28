if (Host.DataType === '$DATATYPE$') {
    // init dispatcher with options
    //Dispatcher.init(Script.dispatcherOpts);

    // function that does all the magic
    Dispatcher.process();
} else {
    _rp(_t('core.error0'));
}
