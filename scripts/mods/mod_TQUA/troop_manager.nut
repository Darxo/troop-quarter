this.troop_manager <- {
	m = {
        Formation = "Formation",    // Name of the Formation of the Player Roster
        Reserve = "Reserve",        // Name of the Reserve of the Player Roster

		DefaultSlotLimit = 27,

        ManagedRosters = {}
	},

	function create()
	{
		this.registerPlayerRosters();
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

	// Returns a Table with one entry for each managed roster in this class. Key = RosterID and Value is a table of all its data
	function queryData()
	{
		local rosterData = {};
		foreach(id, managedRoster in this.m.ManagedRosters)
		{
			if (managedRoster.isActive() == false) continue;
			rosterData[id] <- managedRoster.queryData(this);
		}
		local result = {};
		result.RostersData <- rosterData;
		result.PlayerBrotherCap <- ::World.Assets.m.BrothersMax;
		return result;
	}

	// A "Formation" has null slots indicating empty slots in the battle formation.
	// Converts non-null actors from a passed array into UI Data and returns the newly generated Array
	function convertActorsToUIData( _brotherArray, _isFormationAlready = true, _slotLimit = 27 )
	{
		local arraySize = _isFormationAlready ? _brotherArray.len() : _slotLimit;

		local result = [];
		result.resize(arraySize, null);

		local hasUnplaced = false;
		foreach(i, _brother in _brotherArray)
		{
			if (_brother == null) continue;
			if (_brother.m.PlaceInFormation == 255)
			{
				hasUnplaced = true;
				continue;
			};
			if (_isFormationAlready == true) result[i] = ::UIDataHelper.convertEntityToUIData(_brother, null);
			if (_isFormationAlready == false) result[_brother.getPlaceInFormation()] = ::UIDataHelper.convertEntityToUIData(_brother, null);
		}

		if (hasUnplaced)
		{
			local resultIndex = 0;
			foreach(_brother in _brotherArray)
			{
				if (_brother == null) continue;
				if (_brother.m.PlaceInFormation != 255) continue;

				for(; resultIndex < result.len(); resultIndex++)
				{
					if (result[resultIndex] != null) continue;
					// _brother.setPlaceInFormation(resultIndex);
					result[resultIndex] = ::UIDataHelper.convertEntityToUIData(_brother, null);
					break;
				}
			}
		}

		return result;
	}

	// Changes the place in formation of a single brother only within their own roster
    function relocateActor( _rosterID, _actorID, _newPosition )
    {
		// ::logWarning("Relocate the brother '" + _actorID + "' from roster '" + _rosterID + "' into position '" + _newPosition + "'");
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
		// ::logWarning("Transfer the brother '" + _actorID + "' from sourceRoster '" + _sourceID + "' into targetRoster '" + _targetID + "' into position '" + _newPosition + "'");

		local sourceRoster = this.getManagedRoster(_sourceID);
		local targetRoster = this.getManagedRoster(_targetID);

		local actorToRemove = null;
		foreach(actor in sourceRoster.getAll())
		{
			if (actor.getID() == _actorID) actorToRemove = actor;
		}
		if (actorToRemove == null) return;

		targetRoster.insertActor(actorToRemove);	// Insert needs to happen first or there may be critical exception
		sourceRoster.removeActor(actorToRemove);
		actorToRemove.setPlaceInFormation(_newPosition);
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
        if (_data[0] == "Reserve") newPosition += 18;	// Hack because Reserve and Formation are the same roster in vanilla

        this.relocateActor( _data[0], _data[1], newPosition );
	}

    // Called from JavaScript
    // _data[0] = brotherID		_data[1] = tagA			_data[2] = targetIndex		_data[3] = tagB
	function onTransferBrother( _data )
	{
		// Todo do some input validation

		local newPosition = _data[2];

		// Hard-Coded intercept to deal with the way the vanilla roster works
		if (_data[3] == this.m.Reserve) newPosition += 18;
        if (_data[1] == this.m.Formation && _data[3] == this.m.Reserve) return this.relocateActor(_data[1], _data[0], newPosition);
        if (_data[1] == this.m.Reserve && _data[3] == this.m.Formation) return this.relocateActor(_data[1], _data[0], newPosition);

		this.transferBrother(_data[0], _data[1], newPosition, _data[3]);
	}

// Initializer functions:
	function registerPlayerRosters()
	{
		// Add an entry for the Formation part of the player roster
		this.addManagedRoster("Formation", {
			isActive = function() {return true},
			queryData = function( _this ) {
				return {
					mName = "Formation",
					mType = "Player",
					mBrotherList = _this.convertActorsToUIData(::World.Assets.getFormation().slice(0, ::modTQUA.Const.PlayerFormationSize)),		// Only pass the first 18 slots of the player roster
					mBrotherMin = 1,
					mBrotherMax = ::Math.min(::modTQUA.Const.PlayerFormationSize, ::World.Assets.getBrothersMaxInCombat()),
					mSlotLimit = ::modTQUA.Const.PlayerFormationSize,
					mAcceptsPlayerCharacters = true,
					mPrimaryDisplayContainer = true,	// These rosters will be displayed in the bottom part of the screen,
					mSharedMaximumBrothers = ::World.Assets.getBrothersMax()	// We want both Formation & Reserve to respect this shared maximum
				}},
			getAll = function() {return ::World.getPlayerRoster().getAll();},
			insertActor = function(_actor) {	// Maybe add Position?
				::World.getPlayerRoster().add(_actor);
				return true;
			},
			removeActor = function(_actor) {
				::World.getPlayerRoster().remove(_actor);
			}
		});

		// Add an entry for the Reserve part of the player roster
		this.addManagedRoster("Reserve", {
			isActive = function() {return true},
			queryData = function( _this ) {
				::World.Assets.updateFormation();	// To make sure we don't have suprises from brothers having a position of 255
				local convertedRoster = _this.convertActorsToUIData(::World.Assets.getFormation().slice(::modTQUA.Const.PlayerFormationSize));	// Only pass the last 9 slots of the player roster for vanilla
				return {
					mName = "Reserve",
					mType = "Player",
					mBrotherList = convertedRoster,
					mBrotherMax = ::modTQUA.Const.PlayerReserveSize,
					mSlotLimit = ::modTQUA.Const.PlayerReserveSize,
					mSlotClasses = "<div class=\"ui-control is-brother-slot is-reserve-slot\"/>",
					mAcceptsPlayerCharacters = true,
					mSharedMaximumBrothers = ::World.Assets.getBrothersMax()	// We want both Formation & Reserve to respect this shared maximum
				}
			},
			getAll = function() {return ::World.getPlayerRoster().getAll();},
			insertActor = function(_actor) {
				::World.getPlayerRoster().add(_actor);
				return true;
			},
			removeActor = function(_actor) {
				::World.getPlayerRoster().remove(_actor);
			}
		});
	}

    // This will scan nearby towns automatically and display their roster. It's only debug and proof of concept at this point
	function registerAutomaticTownRosters()
	{
		this.addManagedRoster("Hire", {
			getSettlement = function()
			{
				local parties = ::World.getAllEntitiesAtPos(::World.State.getPlayer().getPos(), 200.0);
				foreach( party in parties)
				{
					if (party.isLocation() == false) continue;
					if (party.m.LocationType == ::Const.World.LocationType.Settlement) return party;
				}
				return null;
			}
			isActive = function() {
				return (this.getSettlement() != null);
			},
			queryData = function( _this ) {
				return {
					mName = "Hire",
					mType = "Town",
					mBrotherList = _this.convertActorsToUIData(this.getAll(), false, 27),
					mCanRemove = false,
					mCanImport = false,
					mMoodVisible = true,
					mCanReposition = true,
					mCanSelect = true
				}},
			getAll = function() {return ::World.getRoster(this.getSettlement().getID()).getAll();},
			insertActor = function(_actor) {	// Maybe add Position?
				::World.getRoster(this.getSettlement().getID()).add(_actor);
				return true;
			},
			removeActor = function(_actor) {
				::World.getRoster(this.getSettlement().getID()).remove(_actor);
			}
		});
	}

	// Connect a world roster to this screen.
	// _id = unique string within this instance of this manager
	// _name = display name of this roster in the roster screen
	// _rosterID = ID of the world party that this roster is from
	// _slotLimit = amount of slots that will be generated for the player to drop brothers into
	// _brothersMax = amount of brothers that are allowed to be put in here
	function registerRoster( _id, _name, _rosterID, _slotLimit, _brotherMax = null )
	{
		if (_brotherMax == null) _brotherMax = _slotLimit;
		if (_brotherMax > _slotLimit) _brotherMax = _slotLimit;

		this.addManagedRoster(_id, {
			isActive = function() {
				return true;
			},
			queryData = function( _this ) {
				return {
					mName = _name,
					mType = "",		// Maybe this is never needed
					mBrotherMax = _brotherMax,
					mBrotherList = _this.convertActorsToUIData(this.getAll(), false, _slotLimit),
					mSlotLimit = _slotLimit,
					mCanRemove = true,		// Are you take brothers out of this roster?
					mCanImport = true,		// Are you allowed to drop brothers into this roster?
					mMoodVisible = true,	// Is the mood visible?
					mCanReposition = true,	// Can you move brother around within the roster?
					mCanSelect = true		// Can you select and therefore look at the stats of the brothers in this roster?
				}},
			getAll = function() {return ::World.getRoster(_rosterID).getAll();},
			insertActor = function( _actor ) {	// Maybe add Position?
				::World.getRoster(_rosterID).add(_actor);
				return true;
			},
			removeActor = function( _actor ) {
				::World.getRoster(_rosterID).remove(_actor);
			}
		});
	}
};

