this.marketplace_building <- this.inherit("scripts/entity/world/settlements/buildings/building", {
	//modified marketplace.
	m = {
		Stash = null,
        Roster = null
	},

	function getStash()
	{
		return this.m.Stash;
	}

	function create()
	{
		this.building.create();
		this.m.ID = "building.vault";
		this.m.Name = "City Vault";
		this.m.Description = "A secure building that you can use to store items indefinitely.";
		this.m.UIImage = "ui/settlements/vabu_warehouse_01";
		this.m.UIImageNight = "ui/settlements/vabu_warehouse_01_night";
		this.m.Tooltip = "world-town-screen.main-dialog-module.Vault";
		this.m.TooltipIcon = "ui/icons/buildings/fletcher.png";

		this.World.createRoster(this.getID());
        this.m.Roster = ::World.getRoster(this.getID());
	}

	function onClicked( _townScreen )
	{

		_townScreen.getTroopQuarterModule().m.TroopQuarter = this;
		_townScreen.showQuarterDialog();
		this.pushUIMenuStack();
	}

	function onSerialize( _out )
	{
		this.building.onSerialize(_out);
	}

	function onDeserialize( _in )
	{
		this.building.onDeserialize(_in);
	}

});

