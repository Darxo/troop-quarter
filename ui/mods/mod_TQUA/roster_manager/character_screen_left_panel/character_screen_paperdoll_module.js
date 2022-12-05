
"use strict";

CharacterScreenPaperdollModule.prototype.createDIV = function (_parentDiv)
{
    var self = this;

	// create: containers
	this.mContainer = $('<div class="paperdoll-module"/>');
    _parentDiv.append(this.mContainer);

	// create: equipment containers & layouts
	var leftEquipmentColumn = $('<div class="equipment-column"/>');
	this.mContainer.append(leftEquipmentColumn);
	var leftEquipmentColumnLayout = $('<div class="l-equipment-column is-left"/>');
	leftEquipmentColumn.append(leftEquipmentColumnLayout);

	var middleEquipmentColumn = $('<div class="equipment-column is-middle"/>');
	this.mContainer.append(middleEquipmentColumn);
	var middleEquipmentColumnLayout = $('<div class="l-equipment-column"/>');
	middleEquipmentColumn.append(middleEquipmentColumnLayout);

	var rightEquipmentColumn = $('<div class="equipment-column"/>');
	this.mContainer.append(rightEquipmentColumn);
	var rightEquipmentColumnLayout = $('<div class="l-equipment-column is-right"/>');
	rightEquipmentColumn.append(rightEquipmentColumnLayout);

	// create: equipment slots
    var screen = $('.character-screen');
    $.each(this.mLeftEquipmentSlots, function (_key, _value)
    {
		self.createEquipmentSlot(_value, leftEquipmentColumnLayout, screen);
	});
    $.each(this.mMiddleEquipmentSlots, function (_key, _value)
    {
		self.createEquipmentSlot(_value, middleEquipmentColumnLayout, screen);
	});
    $.each(this.mRightEquipmentSlots, function (_key, _value)
    {
		self.createEquipmentSlot(_value, rightEquipmentColumnLayout, screen);
	});

	// create: backpack containers & layouts
	var backpackRow = $('<div class="backpack-row ui-control-character-screen-paperdoll-backpack-row"/>');
	this.mContainer.append(backpackRow);
	var backpackRowLayout = $('<div class="l-backpack-row has-slot-4"/>');
	backpackRow.append(backpackRowLayout);

	// create: backpack slots
	this.mBackpackSlots = [];
	for (var i = 0; i < Constants.Game.MAX_BACKPACK_SLOTS; ++i)
	{
		this.mBackpackSlots.push(this.createBagSlot(i, backpackRowLayout, screen));
	}
};

CharacterScreenPaperdollModule.prototype.destroyDIV = function ()
{
    $.each(this.mLeftEquipmentSlots, function (_key, _value)
    {
        _value.Container.empty();
        _value.Container.remove();
        _value.Container = null;
    });

    $.each(this.mMiddleEquipmentSlots, function (_key, _value)
    {
        _value.Container.empty();
        _value.Container.remove();
        _value.Container = null;
    });

    $.each(this.mRightEquipmentSlots, function (_key, _value)
    {
        _value.Container.empty();
        _value.Container.remove();
        _value.Container = null;
    });

    for (var i = 0; i < this.mBackpackSlots.length; ++i)
    {
        this.mBackpackSlots[i].Container.empty();
        this.mBackpackSlots[i].Container.remove();
        this.mBackpackSlots[i].Container = null;
    }
    this.mBackpackSlots = null;

    this.mContainer.empty();
    this.mContainer.remove();
    this.mContainer = null;
};


CharacterScreenPaperdollModule.prototype.createBagSlot = function (_index, _parentDiv, _screenDiv)
{
    var self = this;

	var result = { };

    result[CharacterScreenIdentifier.ItemFlag.IsBagSlot] = true;
    result.ContainerIsBig = false;

    var layout = $('<div id="backpack-slot-' + _index + '" class="l-slot-container is-backpack"/>');
    _parentDiv.append(layout);

    result.Container = layout.createPaperdollItem(false, Path.GFX + Asset.SLOT_BACKGROUND_BAG);

    // update item data
    var itemData = result.Container.data('item');
    itemData.index = _index;
    itemData.owner = CharacterScreenIdentifier.ItemOwner.Backpack;

    return result;
};

CharacterScreenPaperdollModule.prototype.createEquipmentSlot = function (_slot, _parentDiv, _screenDiv)
{

    var layout = $('<div class="l-slot-container ' + _slot.ContainerClasses + '"/>');
    _parentDiv.append(layout);

    _slot.Container = layout.createPaperdollItem(_slot.ContainerIsBig, _slot.BackgroundImage);

    // update item data
    var itemData = _slot.Container.data('item');
    itemData.owner = CharacterScreenIdentifier.ItemOwner.Paperdoll;
    itemData.slotType = _slot.SlotType;
};


CharacterScreenPaperdollModule.prototype.removeItemFromSlot = function(_slot)
{
    _slot.Container.assignPaperdollItemImage();
    _slot.Container.assignPaperdollItemOverlayImage();
	_slot.Container.setPaperdollRepairImageVisible(false);
};

CharacterScreenPaperdollModule.prototype.clearItems = function()
{
	var self = this;
	$.each(this.mLeftEquipmentSlots, function (_key, _value)
	{
		self.removeItemFromSlot(_value);
	});

	$.each(this.mMiddleEquipmentSlots, function (_key, _value)
	{
		self.removeItemFromSlot(_value);
	});

	$.each(this.mRightEquipmentSlots, function (_key, _value)
	{
		self.removeItemFromSlot(_value);
	});
};

CharacterScreenPaperdollModule.prototype.assignItemToSlot = function(_slot, _entityId, _item, _isBlocked)
{
    // remove item?
    if (_item === null || !(CharacterScreenIdentifier.Item.Id in _item) || !(CharacterScreenIdentifier.Item.ImagePath in _item))
    {
        _slot.Container.assignPaperdollItemImage();
        _slot.Container.assignPaperdollItemOverlayImage();

        // update item data
        var itemData = _slot.Container.data('item') || {};
        itemData.itemId = null;
        itemData.slotType = null;
        itemData.entityId  = null;
        itemData.isChangeableInBattle = null;
        itemData.isBlockingOffhand = null;
        itemData.isAllowedInBag = null;
        _slot.Container.data('item', itemData);
		_slot.Container.setPaperdollRepairImageVisible(false);
    }
    else
    {
        var isSlotBlocked = _isBlocked !== undefined && _isBlocked === true;

        // update item data
        var itemData = _slot.Container.data('item') || {};
        itemData.itemId = _item[CharacterScreenIdentifier.Item.Id];

		// set slot type correctly to offhand if the mainhand is a twohander
        itemData.slotType = isSlotBlocked === true && _item[CharacterScreenIdentifier.Item.Slot] === CharacterScreenIdentifier.ItemSlot.Mainhand ? CharacterScreenIdentifier.ItemSlot.Offhand : _item[CharacterScreenIdentifier.Item.Slot];
        itemData.entityId = _entityId;
        itemData.isChangeableInBattle = (CharacterScreenIdentifier.ItemFlag.IsChangeableInBattle in _item && _item[CharacterScreenIdentifier.ItemFlag.IsChangeableInBattle] === true);
        itemData.isBlockingOffhand = (CharacterScreenIdentifier.ItemFlag.IsBlockingOffhand in _item ? _item[CharacterScreenIdentifier.ItemFlag.IsBlockingOffhand] : false);
        itemData.isAllowedInBag = _item.isAllowedInBag;
        itemData.isUsable = _item.isUsable;
        _slot.Container.data('item', itemData);

        // check size
        var isSmall = false;
        if (!(CharacterScreenIdentifier.ItemFlag.IsBagSlot in _slot) || _slot[CharacterScreenIdentifier.ItemFlag.IsBagSlot] === false)
        {
            if (CharacterScreenIdentifier.ItemFlag.IsLarge in _item && _item[CharacterScreenIdentifier.ItemFlag.IsLarge] === false)
            {
                isSmall = _slot.ContainerIsBig;
            }
        }

        _slot.Container.assignPaperdollItemImage(Path.ITEMS + _item[CharacterScreenIdentifier.Item.ImagePath], isSmall, isSlotBlocked);
        if(_item['imageOverlayPath']) _slot.Container.assignPaperdollItemOverlayImage(Path.ITEMS + _item['imageOverlayPath'], isSmall, isSlotBlocked);
        else _slot.Container.assignPaperdollItemOverlayImage('', isSmall, isSlotBlocked);

		// show amount
        if(!_isBlocked && _item['showAmount'] === true && _item[CharacterScreenIdentifier.Item.Amount] != '')
        {
            _slot.Container.assignPaperdollItemAmount('' + _item[CharacterScreenIdentifier.Item.Amount], _item[CharacterScreenIdentifier.Item.AmountColor]);
        }

		// show repair icon?
		_slot.Container.setPaperdollRepairImageVisible(_item['repair'] && this.mDataSource.isInStashMode());

        // bind tooltip to image layer
        _slot.Container.assignPaperdollItemTooltip(_item[CharacterScreenIdentifier.Item.Id], TooltipIdentifier.ItemOwner.Entity, _entityId);
    }
};


CharacterScreenPaperdollModule.prototype.showSlotLock = function(_slot, _showLock)
{
    _slot.Container.showPaperdollLockedImage(_showLock);
};

CharacterScreenPaperdollModule.prototype.updateSlotLocks = function(_inventoryMode)
{
	switch(_inventoryMode)
	{
		case CharacterScreenDatasourceIdentifier.InventoryMode.Stash:
        case CharacterScreenDatasourceIdentifier.InventoryMode.BattlePreparation:
		{
			this.showSlotLock(this.mMiddleEquipmentSlots.Head, false);
			this.showSlotLock(this.mMiddleEquipmentSlots.Body, false);
		} break;
		case CharacterScreenDatasourceIdentifier.InventoryMode.Ground:
		{
			this.showSlotLock(this.mMiddleEquipmentSlots.Head, true);
			this.showSlotLock(this.mMiddleEquipmentSlots.Body, true);
		} break;
	}
};


CharacterScreenPaperdollModule.prototype.clearBags = function()
{
	for (var i = 0; i < this.mBackpackSlots.length; ++i)
	{
		this.removeItemFromSlot(this.mBackpackSlots[i]);
	}
};

CharacterScreenPaperdollModule.prototype.showBags = function (_numberOfBags)
{
    if (_numberOfBags < 0 || _numberOfBags > Constants.Game.MAX_BACKPACK_SLOTS)
    {
        console.error('ERROR: Failed to show paperdoll bags. Invalid number of bags.');
        return;
    }

    var backpackRowLayout = this.mContainer.find('.l-backpack-row:first');
    if (backpackRowLayout.length > 0)
    {
        for (var i = 0; i < Constants.Game.MAX_BACKPACK_SLOTS; ++i)
        {
            backpackRowLayout.removeClass('has-slot-'+ (i+1));

            if (i < _numberOfBags)
            {
                this.mBackpackSlots[i].Container.parent().removeClass('display-none').addClass('display-block');
            }
            else
            {
                this.mBackpackSlots[i].Container.parent().removeClass('display-block').addClass('display-none');
            }
        }

        backpackRowLayout.addClass('has-slot-' + _numberOfBags);
    }
};


CharacterScreenPaperdollModule.prototype.registerDatasourceListener = function()
{
    this.mDataSource.addListener(ErrorCode.Key, jQuery.proxy(this.onDataSourceError, this));

	this.mDataSource.addListener(CharacterScreenDatasourceIdentifier.Brother.Updated, jQuery.proxy(this.onBrotherUpdated, this));
	this.mDataSource.addListener(CharacterScreenDatasourceIdentifier.Brother.Selected, jQuery.proxy(this.onBrotherSelected, this));

	this.mDataSource.addListener(CharacterScreenDatasourceIdentifier.Inventory.ModeUpdated, jQuery.proxy(this.onInventoryModeUpdated, this));
};


CharacterScreenPaperdollModule.prototype.create = function(_parentDiv)
{
    this.createDIV(_parentDiv);
};

CharacterScreenPaperdollModule.prototype.destroy = function()
{
    this.destroyDIV();
};


CharacterScreenPaperdollModule.prototype.register = function (_parentDiv)
{
    console.log('CharacterScreenPaperdollModule::REGISTER');

    if (this.mContainer !== null)
    {
        console.error('ERROR: Failed to register Paperdoll Module. Reason: Module is already initialized.');
        return;
    }

    if (_parentDiv !== null && typeof(_parentDiv) == 'object')
    {
        this.create(_parentDiv);
    }
};

CharacterScreenPaperdollModule.prototype.unregister = function ()
{
    console.log('CharacterScreenPaperdollModule::UNREGISTER');

    if (this.mContainer === null)
    {
        console.error('ERROR: Failed to unregister Paperdoll Module. Reason: Module is not initialized.');
        return;
    }

    this.destroy();
};

CharacterScreenPaperdollModule.prototype.isRegistered = function ()
{
	if (this.mContainer !== null)
	{
		return this.mContainer.parent().length !== 0;
	}

	return false;
};


CharacterScreenPaperdollModule.prototype.assignEquipment = function (_brotherId, _data)
{
	var blockOffhand = false;
	if (CharacterScreenIdentifier.ItemSlot.Mainhand in _data)
	{
		var mainHand = _data[CharacterScreenIdentifier.ItemSlot.Mainhand];
		blockOffhand = CharacterScreenIdentifier.ItemFlag.IsBlockingOffhand in mainHand && mainHand[CharacterScreenIdentifier.ItemFlag.IsBlockingOffhand] === true;

		this.assignItemToSlot(this.mLeftEquipmentSlots.RightHand, _brotherId, mainHand);

		// add weapon to offhand as semi transparent image
		if (blockOffhand)
		{
			this.assignItemToSlot(this.mRightEquipmentSlots.LeftHand, _brotherId, mainHand, true);
		}
	}

	if (blockOffhand !== true && CharacterScreenIdentifier.ItemSlot.Offhand in _data)
	{
		this.assignItemToSlot(this.mRightEquipmentSlots.LeftHand, _brotherId, _data[CharacterScreenIdentifier.ItemSlot.Offhand]);
	}

	if (CharacterScreenIdentifier.ItemSlot.Head in _data)
	{
		this.assignItemToSlot(this.mMiddleEquipmentSlots.Head, _brotherId, _data[CharacterScreenIdentifier.ItemSlot.Head]);
	}

	if (CharacterScreenIdentifier.ItemSlot.Body in _data)
	{
		this.assignItemToSlot(this.mMiddleEquipmentSlots.Body, _brotherId, _data[CharacterScreenIdentifier.ItemSlot.Body]);
	}

	if (CharacterScreenIdentifier.ItemSlot.Accessory in _data)
	{
		this.assignItemToSlot(this.mLeftEquipmentSlots.Accessory, _brotherId, _data[CharacterScreenIdentifier.ItemSlot.Accessory]);
	}

	if (CharacterScreenIdentifier.ItemSlot.Ammo in _data)
	{
		this.assignItemToSlot(this.mRightEquipmentSlots.Ammo, _brotherId, _data[CharacterScreenIdentifier.ItemSlot.Ammo]);
	}
};

CharacterScreenPaperdollModule.prototype.assignBags = function (_brotherId, _data)
{
	if (jQuery.isArray(_data) && _data.length !== null)
	{
        var numBags = _data.length > Constants.Game.MAX_BACKPACK_SLOTS ? Constants.Game.MAX_BACKPACK_SLOTS : _data.length;
        this.showBags(numBags);

		for (var i = 0; i < numBags; ++i)
		{
			this.assignItemToSlot(this.mBackpackSlots[i], _brotherId, _data[i]);
		}
	}
};


CharacterScreenPaperdollModule.prototype.onBrotherUpdated = function (_dataSource, _brother)
{
	if (this.mDataSource.isSelectedBrother(_brother))
	{
		this.onBrotherSelected(_dataSource, _brother);
	}
};

CharacterScreenPaperdollModule.prototype.onBrotherSelected = function (_dataSource, _brother)
{
	if (_brother !== null && CharacterScreenIdentifier.Entity.Id in _brother)
	{
		this.clearItems();
		this.clearBags();

		if (CharacterScreenIdentifier.Paperdoll.Equipment in _brother)
		{
			this.assignEquipment(_brother[CharacterScreenIdentifier.Entity.Id], _brother[CharacterScreenIdentifier.Paperdoll.Equipment]);
		}

		if (CharacterScreenIdentifier.Paperdoll.Bag in _brother)
		{
			this.assignBags(_brother[CharacterScreenIdentifier.Entity.Id], _brother[CharacterScreenIdentifier.Paperdoll.Bag]);
		}
	}
};

CharacterScreenPaperdollModule.prototype.onInventoryModeUpdated = function (_dataSource, _mode)
{
	this.updateSlotLocks(_mode);
};

CharacterScreenPaperdollModule.prototype.onDataSourceError  = function (_dataSource, _data)
{
    if (_data  === undefined || _data === null || typeof(_data) !== 'number')
    {
        return;
    }

    switch(_data)
    {
        /*
        case ErrorCode.NotEnoughStashSpace:
        {
            this.mSlotCountContainer.shakeLeftRight();
        } break;
        */
    }

    console.info('CharacterScreenPaperdollModule::onDataSourceError(' + _data + ')');
};
