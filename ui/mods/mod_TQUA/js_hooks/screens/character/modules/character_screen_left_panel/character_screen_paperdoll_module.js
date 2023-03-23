
var modTQUA_CharacterScreenPaperdollModule_createEquipmentSlot = CharacterScreenPaperdollModule.prototype.createEquipmentSlot;
CharacterScreenPaperdollModule.prototype.createEquipmentSlot = function (_slot, _parentDiv, _screenDiv)
{
    modTQUA_CharacterScreenPaperdollModule_createEquipmentSlot.call(this, _slot, _parentDiv, _screenDiv);
    if (this.mDataSource.mIsRosterManager === undefined) return;

    // Turn off all event stuff that was assigned to this slot.
    _slot.Container.off();
}

var modTQUA_CharacterScreenPaperdollModule_createBagSlot = CharacterScreenPaperdollModule.prototype.createBagSlot;
CharacterScreenPaperdollModule.prototype.createBagSlot = function (_index, _parentDiv, _screenDiv)
{
    var result = modTQUA_CharacterScreenPaperdollModule_createBagSlot.call(this, _index, _parentDiv, _screenDiv);

    // Turn off all event stuff that was assigned to this slot.
    if (this.mDataSource.mIsRosterManager !== undefined) result.Container.off();

    return result;
}
