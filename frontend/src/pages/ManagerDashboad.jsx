import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ManagerDashboard() {
  const managerId = localStorage.getItem('managerId');
  const [managerName, setManagerName] = useState('');
  const [queues, setQueues] = useState({});
  const [currentQueueId, setCurrentQueueId] = useState(null);
  const [tokenCounter, setTokenCounter] = useState(1);
  const [queueName, setQueueName] = useState('');
  const [persons, setPersons] = useState([]);
  const [personName, setPersonName] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalQueues: 0,
    totalTokensServed: 0,
    totalWaitTime: 0,
    servedTokens: 0,
  });

  const url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchManagerAndQueues = async () => {
      try {
        const response = await axios.get(`${url}/manager/${managerId}`);
        setManagerName(response.data.name);
        localStorage.setItem('managerName', response.data.name);

        const queuesResponse = await axios.get(`${url}/manager/queues/${managerId}`);
        const queuesData = queuesResponse.data;

        const formattedQueues = {};
        queuesData.forEach(q => {
          formattedQueues[q._id] = {
            id: q._id,
            name: q.name,
            tokens: [],
            createdAt: new Date(q.createdAt),
            totalServed: q.totalServed,
          };
        });

        setQueues(formattedQueues);
        setAnalytics(prev => ({ ...prev, totalQueues: queuesData.length }));
      } catch (error) {
        console.error('Error fetching manager or queues:', error);
      }

    };

    if (managerId) fetchManagerAndQueues();
  }, [managerId, url]);


  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const moveToTop = (tokenId) => {
    const queue = queues[currentQueueId];
    const tokenIndex = queue.tokens.findIndex(t => t.id === tokenId);
    if (tokenIndex <= 0) return; // Already at top or not found

    const newTokens = [...queue.tokens];
    const [movedToken] = newTokens.splice(tokenIndex, 1);

    // Insert at position 0 (very top of the queue)
    newTokens.unshift(movedToken);

    // Update positions
    newTokens.forEach((token, idx) => (token.position = idx + 1));

    setQueues(prev => ({
      ...prev,
      [currentQueueId]: { ...queue, tokens: newTokens },
    }));
  };

  // Drag and drop handlers
  const handleDragStart = (e, tokenId, index) => {
    if (index === 0) return; // Don't allow dragging the first item
    setDraggedItem(tokenId);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (!draggedItem) return;

    // Get the drop target
    const dropTarget = e.target.closest('.card');
    if (!dropTarget) return;

    const queue = queues[currentQueueId];
    const draggedTokenIndex = queue.tokens.findIndex(t => t.id === draggedItem);

    // Find the target index based on the card that was dropped on
    const allCards = Array.from(dropTarget.parentNode.children);
    const dropIndex = allCards.indexOf(dropTarget);

    if (draggedTokenIndex === dropIndex) return; // Same position
    if (dropIndex === 0) return; // Don't allow dropping on first position

    const newTokens = [...queue.tokens];
    const [draggedToken] = newTokens.splice(draggedTokenIndex, 1);
    newTokens.splice(dropIndex, 0, draggedToken);

    // Update positions
    newTokens.forEach((token, idx) => (token.position = idx + 1));

    setQueues(prev => ({
      ...prev,
      [currentQueueId]: { ...queue, tokens: newTokens },
    }));

    // Clean up
    setDraggedItem(null);
    setDraggedIndex(null);
  };

  const createQueue = async () => {
    if (!queueName.trim()) {
      alert('Please enter a queue name');
      return;
    }

    try {
      const response = await axios.post(`${url}/manager/queue`, {
        name: queueName,
        managerId,
      });

      const savedQueue = response.data;

      setQueues(prev => ({
        ...prev,
        [savedQueue._id]: {
          id: savedQueue._id,
          name: savedQueue.name,
          tokens: [],
          createdAt: new Date(savedQueue.createdAt),
          totalServed: 0,
        },
      }));

      setAnalytics(prev => ({ ...prev, totalQueues: prev.totalQueues + 1 }));

      alert(`Queue "${savedQueue.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating queue:', error);
      alert('Failed to create queue. Try again later.');
    }

    setQueueName('');
  };


  const selectQueue = async (queueId) => {
    setCurrentQueueId(queueId);

    try {
      const response = await axios.get(`${url}/manager/${managerId}/queue/${queueId}/persons`);
      const fetchedPersons = response.data;

      const tokens = fetchedPersons.map((person, index) => ({
        id: person._id,
        name: person.name,
        addedAt: person.addedAt,
        position: person.position,
      }));

      setQueues(prev => ({
        ...prev,
        [queueId]: {
          ...prev[queueId],
          tokens,
        },
      }));

      setPersons(fetchedPersons); // optional if needed elsewhere
    } catch (error) {
      console.error('Failed to fetch persons:', error);
      setQueues(prev => ({
        ...prev,
        [queueId]: {
          ...prev[queueId],
          tokens: [],
        },
      }));
    }
  };


  const addToQueue = async () => {
    if (!personName.trim()) return alert("Please enter a person's name");
    if (!currentQueueId) return alert('Please select a queue first');

    const token = {
      id: tokenCounter,
      name: personName,
      addedAt: new Date(),
      position: queues[currentQueueId].tokens.length + 1,
    };

    setQueues(prev => ({
      ...prev,
      [currentQueueId]: {
        ...prev[currentQueueId],
        tokens: [...prev[currentQueueId].tokens, token],
      },
    }));

    setTokenCounter(prev => prev + 1);
    setPersonName('');

    try {
      await axios.post(`${url}/manager/person`, {
        name: token.name,
        queueId: currentQueueId,
        position: token.position,
      });
    } catch (error) {
      console.error('Error adding person to queue:', error);
    }
  };

  const moveUp = (tokenId) => {
    const queue = queues[currentQueueId];
    const index = queue.tokens.findIndex(t => t.id === tokenId);
    if (index <= 0) return;

    const newTokens = [...queue.tokens];
    [newTokens[index], newTokens[index - 1]] = [newTokens[index - 1], newTokens[index]];
    newTokens.forEach((token, idx) => (token.position = idx + 1));

    setQueues(prev => ({
      ...prev,
      [currentQueueId]: { ...queue, tokens: newTokens },
    }));
  };

  const moveDown = (tokenId) => {
    const queue = queues[currentQueueId];
    const index = queue.tokens.findIndex(t => t.id === tokenId);
    if (index >= queue.tokens.length - 1) return;

    const newTokens = [...queue.tokens];
    [newTokens[index], newTokens[index + 1]] = [newTokens[index + 1], newTokens[index]];
    newTokens.forEach((token, idx) => (token.position = idx + 1));

    setQueues(prev => ({
      ...prev,
      [currentQueueId]: { ...queue, tokens: newTokens },
    }));
  };

  const serveNext = () => {
    if (!currentQueueId || queues[currentQueueId].tokens.length === 0) {
      return alert('No tokens in queue to serve');
    }

    const queue = queues[currentQueueId];
    const servedToken = queue.tokens[0];
    const waitTime = (new Date() - new Date(servedToken.addedAt)) / (1000 * 60); // in minutes

    const newTokens = queue.tokens.slice(1);
    newTokens.forEach((token, idx) => (token.position = idx + 1));

    setQueues(prev => ({
      ...prev,
      [currentQueueId]: {
        ...queue,
        tokens: newTokens,
        totalServed: queue.totalServed + 1,
      },
    }));

    setAnalytics(prev => ({
      ...prev,
      totalTokensServed: prev.totalTokensServed + 1,
      totalWaitTime: prev.totalWaitTime + waitTime,
      servedTokens: prev.servedTokens + 1,
    }));

    alert(`Served: ${servedToken.name} (Token #${servedToken.id})`);
  };

  const cancelToken = async (tokenId) => {
    const queue = queues[currentQueueId];
    const canceledToken = queue.tokens.find(t => t.id === tokenId);
    const newTokens = queue.tokens.filter(t => t.id !== tokenId);
    newTokens.forEach((token, idx) => (token.position = idx + 1));

    // Update UI immediately
    setQueues(prev => ({
      ...prev,
      [currentQueueId]: { ...queue, tokens: newTokens },
    }));

    // Call backend to delete
    try {
      await axios.delete(`${url}/manager/person/${tokenId}`);
    } catch (error) {
      console.error('Failed to delete person from DB:', error);
    }

    alert(`Cancelled token for: ${canceledToken.name}`);
  };


  const getWaitTime = (addedAt) =>
    Math.round((new Date() - new Date(addedAt)) / (1000 * 60));

  const currentQueue = currentQueueId ? queues[currentQueueId] : null;
  const currentQueueLength = currentQueue ? currentQueue.tokens.length : 0;
  const avgWaitTime = analytics.servedTokens
    ? Math.round(analytics.totalWaitTime / analytics.servedTokens)
    : 0;

  return (
    <div className="text-light min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-dark py-4 shadow" style={{ backgroundColor: '#1c4fa0ff' }}>
        <div className="container d-flex justify-content-between align-items-center">
          <h2 className="navbar-brand mb-0 d-flex align-items-center fs-3 fw-bold">
            <span className="me-2 fs-2">🎫</span>
            Queue Management System
          </h2>
          <div className="d-flex align-items-center">
            <p className="mb-0 me-4 fs-5">
              Welcome, <strong>{managerName || 'Manager'}</strong>
            </p>
            <button
              onClick={handleLogout}
              className="btn btn-danger fw-semibold px-4 py-2"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container-fluid py-4">

        {/* Main Content */}
        <div className="row mb-4">
          {/* Queue Management */}
          <div className="col-lg-6 mb-4">
            <div className="card shadow-lg h-100" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
              <div className="card-body">
                <h3 className="card-title text-primary border-bottom pb-2">Queue Management</h3>

                {/* Create Queue */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Create New Queue:</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter queue name"
                      value={queueName}
                      onChange={(e) => setQueueName(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={createQueue}>
                      Create Queue
                    </button>
                  </div>
                </div>

                {/* Select Queue */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Select Active Queue:</label>
                  <select
                    className="form-select"
                    value={currentQueueId || ''}
                    onChange={(e) => selectQueue(e.target.value)}
                  >
                    <option value="">Select a queue</option>
                    {Object.entries(queues).map(([id, queue]) => (
                      <option key={id} value={id}>{queue.name}</option>
                    ))}
                  </select>
                </div>

                {/* Queue Controls */}
                {currentQueueId && (
                  <>
                    <div className="alert alert-info text-center mb-3">
                      <strong>Managing: {currentQueue.name}</strong>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Add Person to Queue:</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter person's name"
                          value={personName}
                          onChange={(e) => setPersonName(e.target.value)}
                        />
                        <button className="btn btn-success" onClick={addToQueue}>
                          Add to Queue
                        </button>
                      </div>
                    </div>

                    <div className="d-grid">
                      <button className="btn btn-primary btn-lg" onClick={serveNext}>
                        Serve Next Person
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Queue Display */}
          <div className="col-lg-6 mb-4">
            <div className="card shadow-lg h-100" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
              <div className="card-body">
                <h3 className="card-title text-primary border-bottom pb-2">Current Queue</h3>

                {!currentQueueId ? (
                  <div className="text-center text-muted py-5">
                    <em>No active queue selected</em>
                  </div>
                ) : currentQueue.tokens.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <em>Queue is empty</em>
                  </div>
                ) : (
                  <div
                    className="queue-list"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {currentQueue.tokens.map((token, index) => (
                      <div
                        key={token.id}
                        className={`card mb-2 ${index === 0 ? 'border-danger bg-light' : ''}`}
                        draggable={index > 0} // Only allow non-first items to be dragged
                        onDragStart={(e) => handleDragStart(e, token.id, index)}
                        style={{ cursor: index > 0 ? 'move' : 'default' }}
                      >
                        <div className="card-body py-2">
                          <div className="row align-items-center">
                            <div className="col-auto">
                              <span className="badge bg-primary rounded-pill fs-6">
                                {token.position}
                              </span>
                            </div>
                            <div className="col">
                              <div className="fw-bold">{token.name}</div>
                              <small className="text-muted">
                                Waiting: {getWaitTime(token.addedAt)} min
                              </small>
                            </div>
                            <div className="col-auto">
                              <div className="btn-group btn-group-sm">
                                {index > 0 && (
                                  <button
                                    className="btn btn-warning"
                                    onClick={() => moveToTop(token.id)}
                                    title="Move to top for service"
                                  >
                                    ⬆️ Priority
                                  </button>
                                )}
                                <button
                                  className="btn btn-danger"
                                  onClick={() => cancelToken(token.id)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
              <div className="card-body">
                <h3 className="card-title text-primary border-bottom pb-2">Analytics Dashboard</h3>

                {/* Stats Cards */}
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card bg-light shadow-sm">
                      <div className="card-body text-center">
                        <div className="display-6 fw-bold text-primary">{analytics.totalQueues}</div>
                        <div className="text-muted small">Total Queues</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-light shadow-sm">
                      <div className="card-body text-center">
                        <div className="display-6 fw-bold text-success">{analytics.totalTokensServed}</div>
                        <div className="text-muted small">Total Tokens Served</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-light shadow-sm">
                      <div className="card-body text-center">
                        <div className="display-6 fw-bold text-warning">{avgWaitTime}</div>
                        <div className="text-muted small">Avg Wait Time (min)</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-light shadow-sm">
                      <div className="card-body text-center">
                        <div className="display-6 fw-bold text-info">{currentQueueLength}</div>
                        <div className="text-muted small">Current Queue Length</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="card bg-white shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Queue Activity Timeline</h5>
                    <div className="bg-light rounded p-4 text-center text-muted">
                      <em>Chart visualization would be implemented here with a charting library like Chart.js or Recharts</em>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ManagerDashboard;