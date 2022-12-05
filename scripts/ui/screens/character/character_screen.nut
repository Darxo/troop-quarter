this.character_screen <- {
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

		MinPlayerRoster = 1,
		PlayerRosterLimit = 18,
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

	function setOnCloseButtonClickedListener( _listener )
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

	function queryPlayerRosterInformation( _result )
	{
		local roster = this.World.Assets.getFormation();

		for( local i = 0; i != roster.len(); i = ++i )
		{
			if (roster[i] != null)
			{
				roster[i] = this.UIDataHelper.convertEntityToUIData(roster[i], null);
			}
		}

		_result.Player <- {
			Roster = roster,
			BrotherCount = ::World.getPlayerRoster().getSize(),
			BrotherMin = this.m.MinPlayerRoster,
			BrotherMax = ::World.Assets.getBrothersMax(),
			SlotLimit = this.m.PlayerRosterLimit
		}

		// _result.BrothersMaxInCombat <- ::World.Assets.getBrothersMaxInCombat();
	}

	function show()
	{
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

	function onPopupDialogIsVisible( _data )
	{
		this.m.PopupDialogVisible = _data[0];
	}

	function queryData()
	{
		local result = {
		};

		this.queryPlayerRosterInformation(result);

		return result;
	}

	function setStashMode()		// Is called from outside
	{
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

	function tactical_onQueryBrothersList()
	{
		local entities = this.Tactical.Entities.getInstancesOfFaction(this.Const.Faction.Player);

		if (entities != null && entities.len() > 0)
		{
			local activeEntity = this.Tactical.TurnSequenceBar.getActiveEntity();
			local result = [];

			foreach( entity in entities )
			{
				result.push(this.UIDataHelper.convertEntityToUIData(entity, activeEntity));
			}

			return result;
		}

		return null;
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

	// THis is getting called from outside. delete later
	function resetInventoryFilter()
	{
	}

};

