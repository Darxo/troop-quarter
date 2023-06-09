this.troop_manager_screen <- this.inherit("scripts/mods/msu/ui_screen", {
	m = {
		JSDataSourceHandle = null,
		OnCloseButtonClickedListener = null,

        TroopManager = null
	},

	function connect()
	{
		this.js_connection.connect();
		this.m.JSDataSourceHandle = this.m.JSHandle.connectToModule("DataSource", this);
	}

	function create()
	{
		this.ui_screen.create();
		this.m.ID = "RosterManagerScreen";
	}

	function init( _troopManager )
	{
		this.m.TroopManager = _troopManager.weakref();
	}

	function clearEventListener()
	{
		this.m.OnCloseButtonClickedListener = null;
		this.ui_screen.clearEventListener();
	}

	function show()
	{
		if (this.m.TroopManager == null)
		{
			::logError("TroopManagerScreen was not initialized yet. It has TroopManager attached yet.")
			return;
		}
		local data = this.m.TroopManager.queryData();
		this.ui_screen.show(data);
	}

	function destroy()
	{
		this.m.JSDataSourceHandle = ::UI.disconnect(this.m.JSDataSourceHandle);
		this.ui_screen.destroy();
	}

	function toggle()
	{
		if (this.isAnimating()) return;

		if (this.isVisible()) this.hide();
		else this.show();
	}

	function loadData()
	{
		if (this.m.JSDataSourceHandle == null) return;

		this.m.JSDataSourceHandle.asyncCall("loadFromData", this.queryData());
	}

    // Functions called from JavaScript:
	function onCloseButtonClicked()
	{
		// ::World.State.m.MenuStack.pop();
		this.hide();
	}

    // [0] = rosterID,		[1] = brotherID,		[2] = place in formation
	function onRelocateBrother( _data )
	{
        this.m.TroopManager.onRelocateBrother( _data );
	}

    // Called from JavaScript
    // _data[0] = brotherID		_data[1] = tagA			_data[2] = targetIndex		_data[3] = tagB
	function onTransferBrother( _data )
	{
        this.m.TroopManager.onTransferBrother( _data );
	}
});

