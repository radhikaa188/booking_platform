import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";

function AdminDashboard() {
  const role = localStorage.getItem("role");

  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [screens, setScreens] = useState([
    { name: "", screen_type: "standard", layout: [{ row_id: "A", seat_count: 5, seat_category: "regular" }] },
  ]);
  const [message, setMessage] = useState("");
  const [allScreens, setAllScreens] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [selectedScreenId, setSelectedScreenId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventMessage, setEventMessage] = useState("");

  useEffect(() => {
    api.get("/screens/")
      .then((res) => setAllScreens(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (role !== "admin") {
    return <Navigate to="/events" replace />;
  }

  const addScreen = () => {
    setScreens([...screens, { name: "", screen_type: "standard", layout: [{ row_id: "A", seat_count: 5, seat_category: "regular" }] }]);
  };

  const removeScreen = (screenIndex) => {
    setScreens(screens.filter((_, i) => i !== screenIndex));
  };

  const updateScreenField = (screenIndex, field, value) => {
    const updated = [...screens];
    updated[screenIndex][field] = value;
    setScreens(updated);
  };

  const addRow = (screenIndex) => {
    const updated = [...screens];
    updated[screenIndex].layout.push({ row_id: "", seat_count: 5, seat_category: "regular" });
    setScreens(updated);
  };

  const removeRow = (screenIndex, rowIndex) => {
    const updated = [...screens];
    updated[screenIndex].layout = updated[screenIndex].layout.filter((_, i) => i !== rowIndex);
    setScreens(updated);
  };

  const updateRowField = (screenIndex, rowIndex, field, value) => {
    const updated = [...screens];
    updated[screenIndex].layout[rowIndex][field] = value;
    setScreens(updated);
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await api.post("/venues/onboard", {
        name: venueName,
        address,
        city,
        screens: screens.map((s) => ({
          ...s,
          layout: s.layout.map((r) => ({ ...r, seat_count: Number(r.seat_count) })),
        })),
      });
      setMessage(`Venue created! ID: ${response.data.id}`);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to create venue");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setEventMessage("");

    try {
      const response = await api.post("/events/", {
        name: eventName,
        description: eventDescription,
        start_time: startTime,
        end_time: endTime,
        screen_id: Number(selectedScreenId),
      });
      setEventMessage(`Event created! ID: ${response.data.id}`);
    } catch (err) {
      setEventMessage(err.response?.data?.detail || "Failed to create event");
    }
  };

  return (
    <div className="page-container admin-dashboard">
      <h2 className="page-title">Admin Dashboard</h2>

      <div className="admin-form-section">
        <h3>Create Venue</h3>
        <form onSubmit={handleCreateVenue}>
          <div className="form-group-row">
            <input placeholder="Venue Name" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
            <input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>

          {screens.map((screen, screenIndex) => (
            <div key={screenIndex} className="admin-screen-card">
              <h4>Screen {screenIndex + 1}</h4>
              <div className="form-group-row">
                <input
                  placeholder="Screen Name"
                  value={screen.name}
                  onChange={(e) => updateScreenField(screenIndex, "name", e.target.value)}
                />
                <select
                  value={screen.screen_type}
                  onChange={(e) => updateScreenField(screenIndex, "screen_type", e.target.value)}
                >
                  <option value="standard">Standard</option>
                  <option value="imax">IMAX</option>
                  <option value="4dx">4DX</option>
                </select>
                {screens.length > 1 && (
                  <button type="button" className="btn-danger-action" onClick={() => removeScreen(screenIndex)}>Remove Screen</button>
                )}
              </div>

              <h5>Seat Rows</h5>
              {screen.layout.map((row, rowIndex) => (
                <div key={rowIndex} className="seat-row-entry">
                  <input
                    placeholder="Row (e.g. A)"
                    value={row.row_id}
                    onChange={(e) => updateRowField(screenIndex, rowIndex, "row_id", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Seat Count"
                    value={row.seat_count}
                    onChange={(e) => updateRowField(screenIndex, rowIndex, "seat_count", e.target.value)}
                  />
                  <select
                    value={row.seat_category}
                    onChange={(e) => updateRowField(screenIndex, rowIndex, "seat_category", e.target.value)}
                  >
                    <option value="regular">Regular</option>
                    <option value="premium">Premium</option>
                    <option value="recliner">Recliner</option>
                  </select>
                  {screen.layout.length > 1 && (
                    <button type="button" className="btn-danger-action" onClick={() => removeRow(screenIndex, rowIndex)}>Remove Row</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-secondary-action" onClick={() => addRow(screenIndex)}>+ Add Row</button>
            </div>
          ))}

          <button type="button" className="btn-secondary-action" onClick={addScreen}>+ Add Screen</button>
          <br /><br />
          <button type="submit" className="btn-submit-action">Create Venue</button>
        </form>
        {message && <p className="admin-status-msg">{message}</p>}
      </div>

      <hr className="admin-divider" />

      <div className="admin-form-section">
        <h3>Create Event</h3>
        <form onSubmit={handleCreateEvent}>
          <div className="form-group-row">
            <input
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
            <input
              placeholder="Description"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
            />
            <select value={selectedScreenId} onChange={(e) => setSelectedScreenId(e.target.value)}>
              <option value="">-- Select Screen --</option>
              {allScreens.map((screen) => (
                <option key={screen.id} value={screen.id}>
                  Screen ID {screen.id} — {screen.name} ({screen.screen_type})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-row">
            <div>
              <label>Start Time: </label>
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <label>End Time: </label>
              <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn-submit-action">Create Event</button>
        </form>
        {eventMessage && <p className="admin-status-msg">{eventMessage}</p>}
      </div>
    </div>
  );
}

export default AdminDashboard;