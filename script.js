const tournamentId = "55685";
const courtNumber = 0;
const scoreboardEl = document.getElementById('scoreboard');

// Mock data instead of real API calls
function getCourtId(tournamentId, courtIndex) {
  // Return mock court ID
  return Promise.resolve("mock-court-id");
}

function getScoreboard(courtId) {
  // Return mock scoreboard data
  const mockData = {
    liveMatch: {
      base: {
        firstParticipant: [{ firstName: "Alice", lastName: "Smith" }],
        secondParticipant: [{ firstName: "Bob", lastName: "Johnson" }]
      },
      state: {
        score: {
          firstParticipantScore: 3,
          secondParticipantScore: 2,
          detailedResult: [
            { firstParticipantScore: 11, secondParticipantScore: 8 },
            { firstParticipantScore: 9, secondParticipantScore: 11 },
            { firstParticipantScore: 11, secondParticipantScore: 6 }
          ]
        },
        matchTime: "00:12",
        serve: {
          isFirstParticipantServing: true
        },
        matchAction: "null"
      }
    },
    previousMatch: {
      base: {
        firstParticipant: [{ firstName: "Carol", lastName: "Davis" }],
        secondParticipant: [{ firstName: "Dave", lastName: "Miller" }]
      },
      state: {
        score: {
          detailedResult: [
            { firstParticipantScore: 11, secondParticipantScore: 5 },
            { firstParticipantScore: 11, secondParticipantScore: 9 }
          ]
        },
        totalDurationInSeconds: 950
      }
    },
    nextMatch: {
      firstParticipant: [{ firstName: "Eve", lastName: "Taylor" }],
      secondParticipant: [{ firstName: "Frank", lastName: "Wilson" }],
      className: "Open A",
      time: "15:30"
    }
  };

  return Promise.resolve(mockData);
}

function formatName(p) {
  return `${p.firstName[0]}. ${p.lastName}`;
}

function renderLiveMatch(liveMatch) {
  const p1 = liveMatch.base.firstParticipant[0];
  const p2 = liveMatch.base.secondParticipant[0];
  const score = liveMatch.state.score;
  const elapsed = liveMatch.state.matchTime || "";
  const servingFirst = liveMatch.state.serve?.isFirstParticipantServing;

  scoreboardEl.innerHTML = `
    <div class="live-match">
      <div class="player-row">
        <div class="player-name-container">
          ${servingFirst ? '<div class="serving-arrow"></div>' : '<div class="no-arrow"></div>'}
          <div class="player-name">${formatName(p1)}</div>
        </div>
        <div class="score-box">${score.firstParticipantScore}</div>
      </div>
      <div class="player-row">
        <div class="player-name-container">
          ${!servingFirst ? '<div class="serving-arrow"></div>' : '<div class="no-arrow"></div>'}
          <div class="player-name">${formatName(p2)}</div>
        </div>
        <div class="score-box">${score.secondParticipantScore}</div>
      </div>
      <div class="match-time">${elapsed}</div>
    </div>
  `;
}

function renderNoMatch(prevMatch, nextMatch) {
  let prevHTML = "";
  if (prevMatch) {
    const p1 = prevMatch.base.firstParticipant[0];
    const p2 = prevMatch.base.secondParticipant[0];
    const sets = prevMatch.state?.score?.detailedResult || [];
    const durationMin = prevMatch.state?.totalDurationInSeconds
      ? Math.floor(prevMatch.state.totalDurationInSeconds / 60)
      : "N/A";
    prevHTML = `
      <div class="previous-match">
        <div class="score-row">
          <span>${formatName(p1)}</span>
          <span>${sets.map(s => s.firstParticipantScore).join(" ")}</span>
        </div>
        <div class="score-row">
          <span>${formatName(p2)}</span>
          <span>${sets.map(s => s.secondParticipantScore).join(" ")}</span>
        </div>
        <div>Duration: ${durationMin} min</div>
      </div>
    `;
  }

  let nextHTML = "";
  if (nextMatch) {
    const p1 = nextMatch.firstParticipant[0];
    const p2 = nextMatch.secondParticipant[0];
    nextHTML = `
      <div class="next-match">
        <div>${formatName(p1)} vs ${formatName(p2)}</div>
        <div>Class: ${nextMatch.className || "N/A"}</div>
        <div>Time: ${nextMatch.time || "TBD"}</div>
      </div>
    `;
  }

  scoreboardEl.innerHTML = `
    <div class="no-match">
      ${prevHTML}
      ${nextHTML}
    </div>
  `;
}

async function updateScoreboard() {
  const courtId = await getCourtId(tournamentId, courtNumber);
  const data = await getScoreboard(courtId);

  if (data.liveMatch && data.liveMatch.state?.matchAction === "Play") {
    renderLiveMatch(data.liveMatch);
  } else {
    renderNoMatch(data.previousMatch, data.nextMatch);
  }
}

updateScoreboard();
setInterval(updateScoreboard, 1000);

