import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalQueues: 0,
    totalTokensServed: 0,
    totalWaitTime: 0,
    servedTokens: 0,
  });
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [chartData, setChartData] = useState([]);

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

  // Enhanced drag and drop handlers
  const handleDragStart = (e, tokenId, index) => {
    setDraggedItem(tokenId);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';

    // Add some visual feedback
    e.target.style.opacity = '0.5';
    e.target.style.transform = 'rotate(2deg)';
  };

  const handleDragEnd = (e) => {
    // Reset visual effects
    e.target.style.opacity = '1';
    e.target.style.transform = 'rotate(0deg)';

    // Clean up state
    setDraggedItem(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    // Only clear dragOverIndex if we're actually leaving the container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedItem === null || draggedIndex === null) return;
    if (draggedIndex === dropIndex) return; // Same position

    const queue = queues[currentQueueId];
    const newTokens = [...queue.tokens];

    // Remove the dragged item
    const [draggedToken] = newTokens.splice(draggedIndex, 1);

    // Insert at the new position
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
    setDragOverIndex(null);
  };

  // Helper function to get visual classes for drag state
  const getDragClasses = (index) => {
    let classes = 'card mb-2';

    if (index === 0) {
      classes += ' border-danger bg-light';
    }

    if (draggedIndex === index) {
      classes += ' border-primary border-3'; // Highlight the dragged item
    }

    if (dragOverIndex === index && draggedIndex !== index) {
      classes += ' border-success border-3 bg-success bg-opacity-10'; // Show drop target
    }

    return classes;
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
    setSelectedQueueId(queueId);

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

  const serveNext = async () => {
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

    // Delete the token from backend
    try {
      await axios.delete(`${url}/manager/person/${servedToken.id}`);
    } catch (error) {
      console.error('Failed to delete served person from DB:', error);
    }

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

  const getAvgWaitTime = () => {
    if (!currentQueue || currentQueue.tokens.length === 0) return 0;
    const now = new Date();
    const totalMinutes = currentQueue.tokens.reduce((sum, token) => {
      return sum + (now - new Date(token.addedAt)) / 60000;
    }, 0);
    return Math.round(totalMinutes / currentQueue.tokens.length);
  };

  const fetchQueuesWithTokens = async () => {
    try {
      const url = import.meta.env.VITE_BACKEND_URL;
      const res = await axios.get(`${url}/queue/manager/${managerId}`);
      const queuePromises = res.data.map(async (queue) => {
        const personsRes = await axios.get(`${url}/queue/${queue._id}/persons`);
        return { ...queue, tokens: personsRes.data };
      });
      const queuesWithTokens = await Promise.all(queuePromises);
      setQueues(queuesWithTokens);
    } catch (err) {
      console.error('Error fetching queues or tokens:', err);
    }
  };

  useEffect(() => {
    fetchQueuesWithTokens();
  }, []);

  const calculateAvgWaitTime = (tokens) => {
    const waiting = tokens.filter(t => t.status === 'waiting');
    if (!waiting.length) return 0;

    const now = Date.now();
    const totalWait = waiting.reduce((acc, t) => acc + (now - new Date(t.addedAt).getTime()), 0);
    return Math.round((totalWait / waiting.length) / 60000); // in minutes
  };

  useEffect(() => {
    if (!currentQueueId) {
      setChartData([]);
      return;
    }

    // Initialize chart data right away when queue changes
    const initData = [];

    const queue = queues[currentQueueId];
    if (queue && queue.tokens) {
      const queueLength = queue.tokens.length;
      const avgWaitTime = calculateAvgWaitTime(queue.tokens);

      initData.push({
        time: new Date().toLocaleTimeString(),
        queueLength,
        avgWaitTime,
      });
    }

    setChartData(initData);

    const interval = setInterval(() => {
      const queue = queues[currentQueueId];
      if (!queue || !queue.tokens) return;

      const queueLength = queue.tokens.length;
      const avgWaitTime = calculateAvgWaitTime(queue.tokens);

      const point = {
        time: new Date().toLocaleTimeString(),
        queueLength,
        avgWaitTime,
      };

      setChartData(prev => [...prev.slice(-19), point]);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentQueueId, queues]);


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
                  <div className="queue-list">
                    <div className="mb-2 p-2 bg-info bg-opacity-10 rounded">
                      <small className="text-info fw-bold">
                        💡 Tip: Drag and drop any item to reorder the queue
                      </small>
                    </div>
                    {currentQueue.tokens.map((token, index) => (
                      <div
                        key={token.id}
                        className={getDragClasses(index)}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, token.id, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        style={{
                          cursor: 'move',
                          transition: 'all 0.2s ease',
                          transform: draggedIndex === index ? 'scale(0.98)' : 'scale(1)'
                        }}
                      >
                        <div className="card-body py-2">
                          <div className="row align-items-center">
                            <div className="col-auto">
                              <span className="badge bg-primary rounded-pill fs-6">
                                {token.position}
                              </span>
                            </div>
                            <div className="col">
                              <div className="fw-bold">
                                {draggedIndex === index && (
                                  <span className="badge bg-secondary me-2">Moving...</span>
                                )}
                                {token.name}
                              </div>
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
                        <div className="display-6 fw-bold text-warning">{getAvgWaitTime()}</div>
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
                    <div className="p-4">

                      {currentQueueId && (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="queueLength" stroke="#8884d8" name="Queue Length" />
                            <Line type="monotone" dataKey="avgWaitTime" stroke="#82ca9d" name="Avg Wait Time (min)" />
                          </LineChart>
                        </ResponsiveContainer>
                      )}

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