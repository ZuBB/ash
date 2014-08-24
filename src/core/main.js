if (Host.DataType === Script.acceptedSignalType) {
    // function that does all the magic
    Dispatcher.process();
} else {
    _rp(_t('core.messages.error0'));
}
