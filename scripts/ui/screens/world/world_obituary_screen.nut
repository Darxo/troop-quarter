this.world_obituary_screen <- this.inherit("scripts/ui/screens/world/world_base_screen", {
	m = {
		JSDataSourceHandle = null,
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
		DefaultSlotLimit = 27,

        ManagedRosters = {/*
            ID = {
				queryData = function()
				{
                    return = {
                        mBrotherList = ,

                        mName = "Caravan",
                        mType = "Escort",
                        mBrotherMin = 0,
                        mBrotherMax = 17,
                        mSlotLimit = 27,
                        mCanRemove = false,
                        mCanImport = false,
                        mMoodVisible = false
                    }
				},
				// Inserts an Actor into this roster. Returns true if successfull
				insertActor = function(_actor, _position),
				// Removes an Actor from this roster. Returns true if successfull
				removeActor = function(_actorID)
            }*/
        }

	},

	function create()
	{
		::logWarning("Create()");
		this.world_base_screen.create();

		this.m.PopupDialogVisible = false;
		this.m.JSHandle = this.UI.connect("RosterManagerScreen", this);
		this.m.JSDataSourceHandle = this.m.JSHandle.connectToModule("DataSource", this);

        this.addManagedRoster("Guests", {
			queryData = function( _this ) {
				local dummyArray = [];
				dummyArray.resize(27, null);
				return {
					mName = "Militia",
					mType = "Guests",
					mBrotherList = _this.convertActorsToUIData(dummyArray),
					mBrotherMax = 27,
					// mCanRemove = false,
					// mCanImport = false,
					// mMoodVisible = false
				}},
			getAll = function() {return this.World.getPlayerRoster().getAll();},
			insertActor = function(_actor) {
				return true;
			},
			removeActor = function(_actorID) {
				return true;
			}
        });

        this.addManagedRoster("Caravan", {
			queryData = function( _this ) {
				local dummyArray = [];
				dummyArray.resize(27, null);
				return {
					mName = "Caravan",
					mType = "Escort",
					mBrotherList = _this.convertActorsToUIData(dummyArray),
					mBrotherMax = 12,
					mCanRemove = false,
					mCanImport = false,
					mMoodVisible = false
				}},
			getAll = function() {return this.World.getPlayerRoster().getAll();},
			insertActor = function(_actor) {
				return true;
			},
			removeActor = function(_actorID) {
				return true;
			}
		});

        this.addManagedRoster("Formation", {
            queryData = function( _this ) {
				return {
					mName = "Formation",
					mType = "Player",
					mBrotherList = _this.convertActorsToUIData(::World.Assets.getFormation().slice(0, 18)),		// Only pass the first 18 slots of the player roster
					mBrotherMin = 1,
					mBrotherMax = 12,
					mSlotLimit = 18
				}},
			getAll = function() {return this.World.getPlayerRoster().getAll();},
			insertActor = function(_actor) {	// Maybe add Position?
				if (::World.getPlayerRoster().getSize() >= ::World.Assets.getBrothersMax())
				{
					::logError("Can't insert into PlayerRoster: MaxBrothers reached");
					return false;
				}
				::World.getPlayerRoster().add(_actor);
				return true;
			},
			removeActor = function(_actorID) {
				foreach(bro in ::World.getPlayerRoster().getAll())
				{
					if (bro.getID() != _actorID) continue;
					::World.getPlayerRoster().remove(bro);
					return true;
				}
				::logError("Failed to removeActor: Actor with ID '" + _actorID "' not found.");
				return false;
			}
        });

        this.addManagedRoster("Reserve", {
            queryData = function( _this ) {
				local convertedRoster = _this.convertActorsToUIData(::World.Assets.getFormation().slice(18));	// Only pass the last 9 slots of the player roster for vanilla
				return {
					mName = "Reserve",
					mType = "Player",
					mBrotherList = convertedRoster,
					mBrotherMin = 0,
					mBrotherMax = 9,
					mSlotLimit = 9,
					mSlotClasses = "<div class=\"ui-control is-brother-slot is-reserve-slot\"/>"
				}
			},
			getAll = function() {return this.World.getPlayerRoster().getAll();},
			insertActor = function(_actor) {
				if (::World.getPlayerRoster().getSize() >= ::World.Assets.getBrothersMax())		// Can be removed probably
				{
					return false;
				}
				::World.getPlayerRoster().add(_actor);
				return true;
			},
			removeActor = function(_actorID) {
				foreach(bro in ::World.getPlayerRoster().getAll())
				{
					if (bro.getID() != _actorID) continue;
					::World.getPlayerRoster().remove(bro);
					return true;
				}
				::logError("Failed to removeActor: Actor with ID '" + _actorID "' not found.");
				return false;
			}
        });

		// ::modTQUA.createGuests();

	}

    function addManagedRoster(_rosterID, _getDataFunction)
    {
        this.m.ManagedRosters[_rosterID] <- _getDataFunction;
    }

    // Returns a table that's generated from the 'getData()' function for a given ID
    function getManagedRoster( _rosterID )
    {
        if (_rosterID in this.m.ManagedRosters) return this.m.ManagedRosters[_rosterID];
        return null;
    }

    function queryRosterData( _rosterID )
    {
        local rosterData = this.getManagedRoster(_rosterID);
        local slotLimit = ("mSlotLimit" in rosterData) ? rosterData.mSlotLimit : this.m.DefaultSlotLimit;
        local positionedList = [];
        positionedList.resize(slotLimit, null);
        foreach( _entity in rosterData.mBrotherList )
        {
            positionedList[_entity.getPlaceInFormation()] = _entity
        }
    }

	function isAnimating()
	{
		return this.m.Animating != null && this.m.Animating == true || this.m.PopupDialogVisible != null && this.m.PopupDialogVisible == true;
	}

	function setOnClosePressedListener( _listener )
	{
		this.m.OnCloseButtonClickedListener = _listener;
	}

	function clearEventListener()
	{
		this.world_base_screen.clearEventListener();
		this.m.OnCloseButtonClickedListener = null;
	}

	// Returns a Table with one entry for each managed roster in this class. Key = RosterID and Value is a table of all its data
	function queryData()
	{
		local rosterData = {};
		foreach(id, managedRoster in this.m.ManagedRosters)
		{
			rosterData[id] <- managedRoster.queryData(this);
		}
		local result = {};
		result.RostersData <- rosterData;
		return result;
	}

	// Converts non-null actors from a passed array into UI Data and returns the newly generated Array
	function convertActorsToUIData( _brotherArray )
	{
		local result = [];
		result.resize(_brotherArray.len(), null);
		foreach(i, _brother in _brotherArray)
		{
			if (_brother == null) continue;
			result[i] = ::UIDataHelper.convertEntityToUIData(_brother, null);
		}
		return result;
	}

	function destroy()
	{
		this.world_base_screen.destroy();
		this.m.JSDataSourceHandle = ::UI.disconnect(this.m.JSDataSourceHandle);
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

	function switchToNextBrother()	// Used via hotkey, TODO implement this with MSU
	{
		this.Tooltip.hide();
		this.m.JSDataSourceHandle.asyncCall("switchToNextBrother", null);
	}

	function switchToPreviousBrother()	// Used via hotkey TODO implement this with MSU
	{
		this.Tooltip.hide();
		this.m.JSDataSourceHandle.asyncCall("switchToPreviousBrother", null);
	}

	function loadData()
	{
		if (this.m.JSDataSourceHandle != null)
		{
			this.m.JSDataSourceHandle.asyncCall("loadFromData", this.queryData());
		}
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

	// Changes the place in formation of a single brother only within their own roster
    function relocateActor( _rosterID, _actorID, _newPosition )
    {
		::logWarning("Relocate the brother '" + _actorID + "' from roster '" + _rosterID + "' into position '" + _newPosition + "'");
		local sourceRoster = this.getManagedRoster(_rosterID);

		local foundActor = null;
		foreach (actor in sourceRoster.getAll())
		{
            if (actor == null) continue;
			if (actor.getID() == _actorID) foundActor = actor;
		 	if (actor.getPlaceInFormation() == _newPosition)
            {
                ::logError("Tried relocating a actor into position " + _newPosition + " but an actor already is already here");
                return;
            }
		}
		if (foundActor == null) return;
		foundActor.setPlaceInFormation(_newPosition);
    }

	// Moves a brother out of a roster and into another roster
    function transferBrother( _actorID, _sourceID, _newPosition, _targetID )
    {
		::logWarning("Transfer the brother '" + _actorID + "' from sourceRoster '" + _sourceID + "' into targetRoster '" + _targetID + "' into position '" + _newPosition + "'");

		local sourceRoster = this.getManagedRoster(_sourceID);
		local targetRoster = this.getManagedRoster(_targetID);

		local removedActor = null;
		foreach(actor in sourceRoster.getAll())
		{
			if (actor.getID() == _actorID) removedActor = actor;
		}
		if (removedActor == null) return;

		if (targetRoster.insertActor(removedActor) == false) return;	// Must be last because you can't insert a brother into the player roster if the same is already present there
		if (sourceRoster.removeActor(removedActor.getID()) == false) return;
		local brothers = ::World.getPlayerRoster().getAll();

		removedActor.setPlaceInFormation(_newPosition);
    }

    // Called from JavaScript
    // [0] = rosterID,		[1] = brotherID,		[2] = place in formation
	function onRelocateBrother( _data )
	{
		local rosterData = this.getManagedRoster(_data[0]);
        if (rosterData == null)
        {
            ::logError("Can't find the roster with the ID: " + _data[0]);
            return;
        }

		// Todo: more input validation

        local newPosition = _data[2];
        if (_data[0] == "Reserve") newPosition += 18;	// Hack because Reserve and Formation are the same roster

        this.relocateActor( _data[0], _data[1], newPosition );
	}

    // Called from JavaScript
    // _data[0] = brotherID		_data[1] = tagA			_data[2] = targetIndex		_data[3] = tagB
	function onTransferBrother( _data )
	{
		// Todo do some input validation

        if (_data[1] == this.m.Formation && _data[3] == this.m.Reserve) return this.relocateActor(_data[1], _data[0], _data[2] + 18);
        if (_data[1] == this.m.Reserve && _data[3] == this.m.Formation) return this.relocateActor(_data[1], _data[0], _data[2]);

		this.transferBrother(_data[0], _data[1], _data[2], _data[3]);
	}

});

