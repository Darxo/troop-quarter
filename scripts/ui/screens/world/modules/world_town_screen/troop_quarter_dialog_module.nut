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
		QuarterMin = 0,
		QuarterMax = 4,
		QuarterLimit = 44,

		UpperRosterLimit = 165,
		RowLength = 11,

		MinPlayerRoster = ::modTQUA.Const.MinPlayerRoster,
		PlayerRosterLimit = ::modTQUA.Const.PlayerRosterLimit,
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

		_result.Quarter <- {
			Roster = roster,
			BrotherCount = brothers.len(),
			BrotherMin = this.m.QuarterMin,
			BrotherMax = this.m.QuarterMax,
			SlotLimit = this.m.QuarterLimit
		}
/*
		_result.QuarterCurrent <- brothers.len();
		_result.QuarterMin <- this.m.QuarterMin;
		_result.QuarterMax <- this.m.QuarterMax;
		_result.QuarterLimit <- this.m.QuarterLimit;
*/
		if ("Assets" in _result)
		{
			_result.Assets.QuarterCurrent <- brothers.len();
			_result.Assets.QuarterMax <- this.m.QuarterMax;
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

		_result.Player <- {
			Roster = roster,
			BrotherCount = ::World.getPlayerRoster().getSize(),
			BrotherMin = this.m.MinPlayerRoster,
			BrotherMax = ::World.Assets.getBrothersMax(),
			SlotLimit = this.m.PlayerRosterLimit
		}

		_result.BrothersMaxInCombat <- ::World.Assets.getBrothersMaxInCombat();
/*
		_result.Player <- roster;
		_result.

		_result.PlayerCurrent <- ::World.getPlayerRoster().getSize();
		_result.PlayerMin <- this.m.MinPlayerRoster;
		_result.PlayerMax <- ::World.Assets.getBrothersMax();
		_result.PlayerLimit <- this.m.PlayerRosterLimit;
*/
		if ("Assets" in _result)
		{
			_result.Assets.PlayerCurrent <- _result.Player.BrotherCount;
			_result.Assets.PlayerMax <- _result.Player.BrotherMax;
		}
	}

	// only ask for the data i need
	function queryAssetsInformation( _assets )
	{
		_assets.PlayerCurrent <- ::World.getPlayerRoster().getSize();
		_assets.PlayerMax <- ::World.Assets.getBrothersMax();
		_assets.QuarterCurrent <- this.getQuarterRoster().getSize();
		_assets.QuarterMax <- this.m.QuarterMax;
	}

	function transferBrother()
	{

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

				bro.setPlaceInFormation(_data[2]);
				break;
			}
		}

		local ret = {
			Assets = {}
		};
		this.queryAssetsInformation(ret.Assets);
		this.m.JSHandle.asyncCall("loadFromData", ret);
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
