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
		::logWarning("Create()");
		this.ui_screen.create();
		this.m.ID = "RosterManagerScreen";
		this.m.TroopManager = ::new("mod_TQUA/troop_manager");
	}

	function setOnClosePressedListener( _listener )
	{
		this.m.OnCloseButtonClickedListener = _listener;
	}

	function clearEventListener()
	{
		this.m.OnCloseButtonClickedListener = null;
		this.ui_screen.clearEventListener();
	}

	// Overwrites
	function show()
	{
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

	// New needed functions
	function onCloseButtonClicked()
	{
		::World.State.m.MenuStack.pop();
		this.hide();
		/*if (this.m.OnCloseButtonClickedListener != null)
		{
			this.m.OnCloseButtonClickedListener();
		}*/
	}

	function onClose()
	{
		::World.State.m.MenuStack.pop();
		this.hide();
		/*
		if (this.m.OnCloseButtonClickedListener != null)
		{
			this.m.OnCloseButtonClickedListener();
		}*/
	}

    // Called from JavaScript
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

