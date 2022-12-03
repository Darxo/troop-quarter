this.troop_quarter_dialog_module <- this.inherit("scripts/ui/screens/ui_module", {
	m = {
		Title = "Troop Quarter",
		Description = "A convenient place for you to store/retrieve your brother with minimum effort",

		// a row can hold 11 slots so with this you have a maximum of 9 rows in the screen
		// change to 9999 so you can feel like the roster size is endless lol

		PlayerID = "player",

		QuarterID = "quarter",
		TroopQuarter = null,

		// Const
		UpperRosterLimit = 165,
		RowLength = 11,

		MinPlayerRoster = ::modTQUA.Const.MinPlayerRoster,
		MaxPlayerRoster = ::modTQUA.Const.MinPlayerRoster
	},
	function create()
	{
		this.m.ID = "TroopQuarterModule";
		this.ui_module.create();
	}

	function getQuarterRoster()
	{
		return this.m.TroopQuarter.m.Roster;
	}

	function getRoster ( _rosterID )
	{
		if ( _rosterID == this.m.PlayerID ) return ::World.getPlayerRoster();
		if ( _rosterID == this.m.QuarterID ) return this.getQuarterRoster();
		::logWarning("Roster: '" + _rosterID + "' not found. Returning null");
		return null;
	}

	function queryLoad()
	{
		local result = {
			Title = this.m.Title,
			SubTitle = this.m.Description,
			Assets = {},
		};
		this.queryPlayerRosterInformation(result);
		this.queryTroopQuarterRosterInformation(result);
		return result;
	}

	function queryTroopQuarterRosterInformation( _result )
	{
		local num = this.m.RowLength;
		local roster = [];
		local brothers = this.getQuarterRoster().getAll();

		foreach (i, b in brothers)
		{
			b.setPlaceInFormation(i);
			roster.push(this.UIDataHelper.convertEntityToUIData(b, null));

			if (roster.len() == this.m.UpperRosterLimit)
			{
				break;
			}
		}

		while (num < roster.len())
		{
			num += this.m.RowLength;
		}

		// for now i limit the max stronghold roster size to be 165 (was 99) which is 15 roster rows, should i expand it?
		// make it so that the stronghold roster formation automatically resize on the screen and there is always at least 33 spare spots in stronghold
		num = this.Math.min(this.m.UpperRosterLimit, num + 33);

		// fill the empty space
		while (roster.len() < num)
		{
			roster.push(null);
		}

		_result.Stronghold <- roster;
		_result.BrothersMaxInStronghold <- num;

		if ("Assets" in _result)
		{
			_result.Assets.StrongholdBrothers <- brothers.len();
			_result.Assets.StrongholdBrothersMax <- num;
		}
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

		_result.Player <- roster;
		_result.BrothersMaxInCombat <- this.World.Assets.getBrothersMaxInCombat();
		_result.BrothersMax <- this.World.Assets.getBrothersMax();

		if ("Assets" in _result)
		{
			_result.Assets.Brothers <- this.World.getPlayerRoster().getSize();
			_result.Assets.BrothersMax <- _result.BrothersMax;
		}
	}

	// only ask for the data i need
	function queryAssetsInformation( _assets )
	{
		_assets.Brothers <- this.World.getPlayerRoster().getSize();
		_assets.BrothersMax <- this.World.Assets.getBrothersMax();
		_assets.StrongholdBrothers <- this.getQuarterRoster().getSize();
		_assets.StrongholdBrothersMax <- this.m.UpperRosterLimit;
	}

	// Changes the place in formation of a single brother only within their roster
	function onRelocateBrother( _data )	// [0] == brotherID, [1] = place in formation
	{
		foreach ( bro in this.World.getPlayerRoster().getAll())
		{
		 	if (bro.getID() == _data[0])
		 	{
		 		bro.setPlaceInFormation(_data[1]);
		 		return;
		 	}
		}

		foreach ( bro in this.getQuarterRoster().getAll())
		{
		 	if (bro.getID() == _data[0])
		 	{
		 		bro.setPlaceInFormation(_data[1]);
		 		return;
		 	}
		}
	}

	function MoveAtoB( _data )
	{
		local isMovingToPlayerRoster = _data[3] == this.m.PlayerID;
		local rosterA = this.getRoster(_data[1]);
		local rosterB = this.getRoster(_data[3]);

		foreach(i, bro in rosterA.getAll())
		{
			if (bro.getID() == _data[0])
			{
				rosterB.add(bro);
				rosterA.remove(bro);

				if (isMovingToPlayerRoster /*&& this.World.State.getBrothersInFrontline() > this.World.Assets.getBrothersMaxInCombat()*/)
				{
					bro.setInReserves(true);
				}

				bro.setPlaceInFormation(_data[2]);
				break;
			}
		}

		local ret = {};
		this.queryAssetsInformation(ret);
		this.m.JSHandle.asyncCall("updateAssets", ret);
	}

	function pushUIMenuStack()
	{
		this.World.State.getMenuStack().push(function ()
		{
			this.World.State.getTownScreen().showMainDialog();
		}, function ()
		{
			return !this.World.State.getTownScreen().isAnimating();
		});
	}

	function onLeaveButtonPressed()
	{
		this.m.Parent.onModuleClosed();
	}

	function onBrothersButtonPressed()
	{
		this.m.Parent.onBrothersButtonPressed();
	}

});
