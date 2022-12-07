this.world_obituary_screen <- {
	m = {
		JSHandle = null,
		JSDataSourceHandle = null,
		InventoryMode = null,
		Visible = null,
		PopupDialogVisible = null,
		Animating = null,


		OnCloseButtonClickedListener = null,


		PlayerID = "Player",
		QuarterID = "Quarter",

        Formation = "Formation",
        Reserve = "Reserve",
        Guests = "Guests",

		MinPlayerRoster = 1,
		PlayerRosterLimit = 27,
	},
	function isVisible()
	{
		return this.m.Visible != null && this.m.Visible == true;
	}

	function isAnimating()
	{
		return this.m.Animating != null && this.m.Animating == true || this.m.PopupDialogVisible != null && this.m.PopupDialogVisible == true;
	}

	function getInventoryMode()
	{
		return this.m.InventoryMode;
	}

	function setOnClosePressedListener( _listener )
	{
		this.m.OnCloseButtonClickedListener = _listener;
	}

	function clearEventListener()
	{
		this.m.OnCloseButtonClickedListener = null;
	}

	function create()
	{
		this.m.InventoryMode = this.Const.CharacterScreen.InventoryMode.Ground;
		this.m.Visible = false;
		this.m.PopupDialogVisible = false;
		this.m.Animating = false;

		this.m.JSHandle = this.UI.connect("RosterManagerScreen", this);
		this.m.JSDataSourceHandle = this.m.JSHandle.connectToModule("DataSource", this);
	}

	function destroy()
	{
		this.clearEventListener();
		this.m.JSDataSourceHandle = this.UI.disconnect(this.m.JSDataSourceHandle);
		this.m.JSHandle = this.UI.disconnect(this.m.JSHandle);
	}

	function queryPlayerFormationInformation()
	{
		local fullRoster = ::World.Assets.getFormation();

		local convertedRoster = [];

		local formationCount = 0;
		for( local i = 0; i != fullRoster.len(); i = ++i )
		{
			if (i >= 18) break;
			if (fullRoster[i] == null)
			{
				convertedRoster.push(null);
				continue;
			}
			convertedRoster.push(this.UIDataHelper.convertEntityToUIData(fullRoster[i], null));
			formationCount++;
		}

		return {
            mName = "Formation",
            mType = "Player",
			mBrotherList = convertedRoster,
			mBrotherMin = 1,
			mBrotherMax = 12,
			mSlotLimit = 18
		}
	}

	function queryGuestInformation()
	{
		local convertedRoster = [];
        convertedRoster.resize(27, null);

		local reserveCount = 0;
        foreach(guest in ::World.getGuestRoster().getAll())
        {
            local slot = guest.getPlaceInFormation();
            convertedRoster[slot] = this.UIDataHelper.convertEntityToUIData(guest, null);
        }

		return {
            mName = "Militia",
            mType = "Guests",
			mBrotherList = convertedRoster,
			mBrotherMin = 0,
			mBrotherMax = 18,
			mSlotLimit = 27,
            mCanRemove = false,
            mCanImport = false,
            mMoodVisible = false
		}
	}

	function queryCaravanInformation()
	{
		// local fullRoster = ::World.Assets.getFormation();

		local convertedRoster = [];
        convertedRoster.resize(27, null)
/*
		local reserveCount = 0;
		for( local i = 0; i != fullRoster.len(); i = ++i )
		{
			if (i < 18) continue;
			if (fullRoster[i] == null)
			{
				convertedRoster.push(null);
				continue;
			}
			convertedRoster.push(this.UIDataHelper.convertEntityToUIData(fullRoster[i], null));
			reserveCount++;
		}*/

		return {
            mName = "Caravan",
            mType = "Escort",
			mBrotherList = convertedRoster.resize(27, null),
			mBrotherMin = 0,
			mBrotherMax = 17,
			mSlotLimit = 27,
            mCanRemove = false,
            mCanImport = false,
            mMoodVisible = false
		}
	}

	function queryPlayerReserveInformation()
	{
		local fullRoster = ::World.Assets.getFormation();

		local convertedRoster = [];

		local reserveCount = 0;
		for( local i = 0; i != fullRoster.len(); i = ++i )
		{
			if (i < 18) continue;
			if (fullRoster[i] == null)
			{
				convertedRoster.push(null);
				continue;
			}
			convertedRoster.push(this.UIDataHelper.convertEntityToUIData(fullRoster[i], null));
			reserveCount++;
		}

		return {
            mName = "Reserve",
            mType = "Player",
			mBrotherList = convertedRoster,
			mBrotherMin = 0,
			mBrotherMax = 5,
			mSlotLimit = 9,
            mSlotClasses = "<div class=\"ui-control is-brother-slot is-reserve-slot\"/>"
		}
	}

	function show()
	{
		::modTQUA.createGuests();
		this.setRosterLimit(("State" in this.World) && this.World.State != null ? this.World.Assets.getBrothersMaxInCombat() : 12);

		if (this.m.JSHandle != null)
		{
			this.Tooltip.hide();
			this.m.JSHandle.asyncCall("show", this.queryData());
		}
	}

	function hide()
	{
		if (this.m.JSHandle != null)
		{
			this.Tooltip.hide();
			this.m.JSHandle.asyncCall("hide", null);
		}
	}

	function toggle()
	{
		if (!this.isAnimating())
		{
			if (this.isVisible())
			{
				this.hide();
			}
			else
			{
				this.show();
			}
		}
	}

	function switchToNextBrother()
	{
		this.Tooltip.hide();
		this.m.JSDataSourceHandle.asyncCall("switchToNextBrother", null);
	}

	function switchToPreviousBrother()
	{
		this.Tooltip.hide();
		this.m.JSDataSourceHandle.asyncCall("switchToPreviousBrother", null);
	}

	function loadBrothersList()
	{
		if (this.m.JSDataSourceHandle != null)
		{
			this.m.JSDataSourceHandle.asyncCall("loadBrothersList", this.onQueryBrothersList());
		}
	}

	function loadData()
	{
		if (this.m.JSDataSourceHandle != null)
		{
			this.m.JSDataSourceHandle.asyncCall("loadFromData", this.queryData());
		}
	}

	function setRosterLimit( _limit )
	{
		if (this.m.JSDataSourceHandle != null)
		{
			this.m.JSDataSourceHandle.asyncCall("setRosterLimit", _limit);
		}
	}

	function onScreenConnected()
	{
	}

	function onScreenDisconnected()
	{
	}

	function onScreenShown()
	{
		this.m.Visible = true;
		this.m.Animating = false;
		this.m.PopupDialogVisible = false;
	}

	function onScreenHidden()
	{
		this.m.Visible = false;
		this.m.Animating = false;
		this.m.PopupDialogVisible = false;
	}

	function onScreenAnimating()
	{
		this.m.Animating = true;
	}

	function onCloseButtonClicked()
	{
		if (this.m.OnCloseButtonClickedListener != null)
		{
			this.m.OnCloseButtonClickedListener();
		}
	}

	function onClose()
	{
		if (this.m.OnCloseButtonClickedListener != null)
		{
			this.m.OnCloseButtonClickedListener();
		}
	}

	function onPopupDialogIsVisible( _data )
	{
		this.m.PopupDialogVisible = _data[0];
	}

	function queryData()
	{
		local result = {
            RostersData = {
                Formation = this.queryPlayerFormationInformation(),
                Reserve = this.queryPlayerReserveInformation(),
                Guests = this.queryGuestInformation(),
                Caravan = this.queryCaravanInformation()
            }
		};

		return result;
	}

	function onQueryBrothersList()
	{
		return this.strategic_onQueryBrothersList();
	}

	function onUpdateNameAndTitle( _data )
	{
		return this.general_onUpdateNameAndTitle(_data);
	}

	function onUpdateRosterPosition( _data )
	{
		this.Tactical.getEntityByID(_data[0]).setPlaceInFormation(_data[1]);
	}

	function strategic_onQueryBrothersList()
	{
		local roster = this.World.Assets.getFormation();

		for( local i = 0; i != roster.len(); i = ++i )
		{
			if (roster[i] != null)
			{
				roster[i] = this.UIDataHelper.convertEntityToUIData(roster[i], null);
			}
		}

		return roster;
	}

	function general_onUpdateNameAndTitle( _data )
	{
		local entity = this.Tactical.getEntityByID(_data[0]);

		if (entity == null || !entity.isPlayerControlled())
		{
			return this.helper_convertErrorToUIData(this.Const.CharacterScreen.ErrorCode.FailedToFindEntity);
		}

		if (_data[1].len() >= 1)
		{
			entity.setName(_data[1]);
		}

		entity.setTitle(_data[2]);
		return this.UIDataHelper.convertEntityToUIData(entity, null);
	}

	function helper_queryEntityItemData( _data, _withStash = false )
	{
		local entity = this.Tactical.getEntityByID(_data[0]);

		if (entity == null || !entity.isPlayerControlled())
		{
			return this.helper_convertErrorToUIData(this.Const.CharacterScreen.ErrorCode.FailedToFindEntity);
		}

		local inventory = entity.getItems();

		if (inventory == null)
		{
			return this.helper_convertErrorToUIData(this.Const.CharacterScreen.ErrorCode.FailedToAcquireInventory);
		}

		local sourceItem = inventory.getItemByInstanceID(_data[1]);

		if (sourceItem == null)
		{
			return this.helper_convertErrorToUIData(this.Const.CharacterScreen.ErrorCode.FailedToFindBagItem);
		}

		local stash = this.Stash;
		local targetItem;
		local targetItemIdx = _data.len() >= 3 && _data[2] != null ? _data[2] : null;

		if (this.m.InventoryMode == this.Const.CharacterScreen.InventoryMode.Ground)
		{
			stash = entity.getTile() != null ? entity.getTile().Items : null;

			if (stash != null && targetItemIdx != null && targetItemIdx >= 0 && targetItemIdx < stash.len())
			{
				targetItem = stash[targetItemIdx];
			}
		}
		else
		{
			local item = stash.getItemAtIndex(targetItemIdx);

			if (item != null)
			{
				targetItem = item.item;
			}
		}

		return {
			entity = entity,
			stash = stash,
			inventory = inventory,
			sourceItem = sourceItem,
			targetItem = targetItem,
			targetItemIdx = targetItemIdx
		};
	}

	function helper_queryEntityBackpackItemData( _data )
	{
		local entity = this.Tactical.getEntityByID(_data[0]);

		if (entity == null || !entity.isPlayerControlled())
		{
			return this.helper_convertErrorToUIData(this.Const.CharacterScreen.ErrorCode.FailedToFindEntity);
		}

		local inventory = entity.getItems();

		if (inventory == null)
		{
			return this.helper_convertErrorToUIData(this.Const.CharacterScreen.ErrorCode.FailedToAcquireInventory);
		}

		local sourceItemIdx = _data[1];
		local sourceItem = inventory.getItemAtBagSlot(sourceItemIdx);

		if (sourceItem == null)
		{
			return this.helper_convertErrorToUIData(this.Const.CharacterScreen.ErrorCode.FailedToFindBagItem);
		}

		local targetItemIdx = _data[2];
		local targetItem = inventory.getItemAtBagSlot(targetItemIdx);
		return {
			entity = entity,
			inventory = inventory,
			sourceItem = sourceItem,
			sourceItemIdx = sourceItemIdx,
			targetItem = targetItem,
			targetItemIdx = targetItemIdx
		};
	}

	function helper_queryBagItemDataToInventory( _data )
	{
		local entity = this.Tactical.getEntityByID(_data[0]);

		if (entity == null || !entity.isPlayerControlled())
		{
			return this.helper_convertErrorToUIData(this.Const.CharacterScreen.ErrorCode.FailedToFindEntity);
		}

		local inventory = entity.getItems();

		if (inventory == null)
		{
			return this.helper_convertErrorToUIData(this.Const.CharacterScreen.ErrorCode.FailedToAcquireInventory);
		}

		local stash;
		local sourceItemIdx = _data.len() >= 3 && _data[2] != null ? _data[2] : null;
		local targetItemIdx = _data.len() >= 4 && _data[3] != null ? _data[3] : null;
		local sourceItem = inventory.getItemAtBagSlot(sourceItemIdx);
		local targetItem;

		if (this.m.InventoryMode == this.Const.CharacterScreen.InventoryMode.Ground)
		{
			local ground = entity.getTile() != null ? entity.getTile().Items : null;

			if (ground != null && targetItemIdx != null && targetItemIdx >= 0 && targetItemIdx < ground.len())
			{
				targetItem = ground[targetItemIdx];
			}
		}
		else
		{
			if (this.Stash == null)
			{
				return this.helper_convertErrorToUIData(this.Const.CharacterScreen.ErrorCode.FailedToAcquireStash);
			}

			stash = this.Stash;
		}

		return {
			entity = entity,
			stash = stash,
			inventory = inventory,
			sourceItem = sourceItem,
			sourceItemIdx = sourceItemIdx,
			targetItem = targetItem,
			targetItemIdx = targetItemIdx,
			swapItem = sourceItemIdx != null
		};
	}

	function helper_queryEquipmentTargetItems( _inventory, _sourceItem )
	{
		local ret = {
			firstItem = null,
			secondItem = null,
			slotsNeeded = 0
		};
		local sourceSlotType = _sourceItem.getSlotType();

		if (sourceSlotType == this.Const.ItemSlot.Offhand && _inventory.hasBlockedSlot(this.Const.ItemSlot.Offhand) == true)
		{
			ret.firstItem = _inventory.getItemAtSlot(this.Const.ItemSlot.Mainhand);
		}
		else if (sourceSlotType == this.Const.ItemSlot.Mainhand && _sourceItem.getBlockedSlotType() == this.Const.ItemSlot.Offhand)
		{
			ret.firstItem = _inventory.getItemAtSlot(this.Const.ItemSlot.Mainhand);
			ret.secondItem = _inventory.getItemAtSlot(this.Const.ItemSlot.Offhand);

			if (ret.firstItem == null)
			{
				ret.firstItem = ret.secondItem;
				ret.secondItem = null;
			}
		}
		else if (sourceSlotType == this.Const.ItemSlot.Bag)
		{
			if (_inventory.hasEmptySlot(this.Const.ItemSlot.Bag))
			{
				ret.firstItem = null;
			}
			else
			{
				ret.firstItem = _inventory.getItemAtBagSlot(0);
			}
		}
		else
		{
			ret.firstItem = _inventory.getItemAtSlot(sourceSlotType);
		}

		if (ret.firstItem != null)
		{
			++ret.slotsNeeded;
		}

		if (ret.secondItem != null)
		{
			++ret.slotsNeeded;
		}

		return ret;
	}

	function helper_convertErrorToUIData( _errorCode )
	{
		local errorString = "Undefined error.";

		switch(_errorCode)
		{
			case this.Const.CharacterScreen.ErrorCode.FailedToFindEntity:
				errorString = "Failed to find entity.";
				break;

			case this.Const.CharacterScreen.ErrorCode.FailedToAcquireInventory:
				errorString = "Failed to acquire inventory.";
				break;

			case this.Const.CharacterScreen.ErrorCode.FailedToFindBagItem:
				errorString = "Failed to find bag item.";
				break;
		}

		return {
			error = errorString,
			code = _errorCode
		};
	}

    function getRosterFromID( _rosterID )
    {
        local roster = ::World.Assets.getFormation();
        if ( _rosterID == this.m.Formation ) return roster.slice(0, 18);
        if ( _rosterID == this.m.Reserve ) return roster.slice(18);
        ::logWarning("getRosterFromID returned nothing");
    }

	// Changes the place in formation of a single brother only within their roster
    // [0] = rosterID,
    // [1] = brotherID,
    // [2] = place in formation
	function onRelocateBrother( _data )
	{
		local roster = this.getRosterFromID(_data[0]);
        ::MSU.Log.printData(roster);
        ::logWarning("getRosterFromID " + _data[0]);
		foreach (bro in roster)
		{
            if (bro == null) continue;
		 	if (bro.getID() != _data[1]) continue;
            local newPosition = _data[2];
            if (roster[newPosition] != null) ::logError("Tried relocating a brother into position " + newPosition + " but a brother already is here");
            if (_data[0] == "Reserve")
            {
                newPosition += 18;
                local fullRoster = ::World.Assets.getFormation();
                if (fullRoster[newPosition] != null) ::logError("Tried relocating a brother into position " + newPosition + " but a brother already is here");
            }
            return bro.setPlaceInFormation(newPosition);
		}
        return;
	}

	// Changes the place in formation of a single brother only within their roster
    // [0] = rosterID,
    // [1] = brotherID,
    // [2] = place in formation
	function onRelocateBrother( _data )
	{
		local roster = ::World.Assets.getFormation();
		foreach (bro in roster)
		{
            if (bro == null) continue;
		 	if (bro.getID() != _data[1]) continue;
            if (roster[_data[2]] != null)
            {
                ::logError("Tried relocating a brother into position " + _data[2] + " but a brother already is here");
                return;
            }
            return bro.setPlaceInFormation(_data[2]);
		}
        return;
	}

    // _data[0] = brotherID
    // _data[1] = tagA
    // _data[2] = targetIndex
    // _data[3] = tagB
	function MoveAtoB( _data )
	{
        if (_data[1] == this.m.Formation && _data[3] == this.m.Reserve) return this.onRelocateBrother([_data[1], _data[0], _data[2] + 18]);
		this.onRelocateBrother([_data[1], _data[0], _data[2]]);
        return;
	}

};

