// Hovedfunksjon som starter når nettsiden lastes
async function initScoreboard() {
    
    // Les av nettadressen (URL) for å finne 'tournamentID' og 'court'
    // Eksempel: https://dittnavn.github.io/squash.html?tournamentID=12345&court=1
    const urlParams = new URLSearchParams(window.location.search);
    const tourneyId = urlParams.get('tournamentID');
    const courtNum = parseInt(urlParams.get('court'), 10); // Gjør om til tall

    // Sjekk om vi mangler parametere i URL-en
    if (!tourneyId || isNaN(courtNum)) {
        console.error("Mangler info! Legg til ?tourney=ID&court=TALL i adressen.");
        // Her kan vi evt. skjule tavlen hvis lenken er feil
        return; 
    }

    let courtId;

    // Spør Rankedin om banelisten for denne turneringen
    try {
        const courtsApiUrl = `https://live.rankedin.com/api/v1/Tournament/${tourneyId}/court-ids`;
        const response = await fetch(courtsApiUrl);
        const courtIds = await response.json();

        // Finn riktig bane-ID (N-1)
        const courtIndex = courtNum - 1; 

        if (courtIndex < 0 || courtIndex >= courtIds.length) {
            console.error(`Fant ikke Bane ${courtNum} i turnering ${tourneyId}.`);
            return;
        }

        courtId = courtIds[courtIndex];
        console.log(`Suksess! Bane ${courtNum} har ID: ${courtId}`);

    } catch (error) {
        console.error("Klarte ikke å hente baneliste:", error);
        return; // Stopp videre kjøring hvis dette feiler
    }

    // Bygg den endelige lenken for å hente selve kampen
    const matchApiUrl = `https://live.rankedin.com/api/v1/Court/${courtId}/scoreboard`;



    async function updateScoreboard() {
        try {
            // Hent data fra Rankedin
            const response = await fetch(matchApiUrl);
            const data = await response.json();

            // Sjekk om det faktisk spilles en kamp akkurat nå
            if (data.liveMatch) {
                const match = data.liveMatch;

                // Oppdater Navn (Henter etternavn)
                document.getElementById('player1-name').innerText = match.base.firstParticipant[0].lastName;
                document.getElementById('player2-name').innerText = match.base.secondParticipant[0].lastName;

                // Oppdater Poeng (Stilling i pågående game)
                const gamesArray = match.state.score.detailedResult;
                if (gamesArray && gamesArray.length > 0) {
                    // Henter det siste spillet i listen (det som pågår nå)
                    const currentGame = gamesArray[gamesArray.length - 1];
                    const p1Points = currentGame.firstParticipantScore;
                    const p2Points = currentGame.secondParticipantScore;
                    document.getElementById('match-score').innerText = `${p1Points} - ${p2Points}`;
                } else {
                    // Hvis kampen nettopp har startet og listen er tom
                    document.getElementById('match-score').innerText = "0 - 0";
                }

                // Oppdater Serve-indikator
                const isP1Serving = match.state.serve.isFirstParticipantServing;
                if (isP1Serving) {
                    document.getElementById('player1-serve').classList.add('active');
                    document.getElementById('player2-serve').classList.remove('active');
                } else {
                    document.getElementById('player1-serve').classList.remove('active');
                    document.getElementById('player2-serve').classList.add('active');
                }

                // Oppdater Sett-score (Games vunnet totalt)
                const p1Sets = match.state.score.firstParticipantScore;
                const p2Sets = match.state.score.secondParticipantScore;
                document.getElementById('player1-sets').innerText = p1Sets;
                document.getElementById('player2-sets').innerText = p2Sets;

            } else {
                console.log("Ingen pågående kamp på denne banen akkurat nå.");
                // Her kan du evt. legge inn kode som skjuler hele tavlen hvis banen er tom
            }

        } catch (error) {
            console.error("Klarte ikke å hente data fra Rankedin:", error);
        }
    }

    // Kjør funksjonen én gang med det samme nettsiden lastes...
    updateScoreboard();

    // ...og be deretter nettsiden om å hente nye data hvert 3. sekund (3000 millisekunder)
    setInterval(updateScoreboard, 3000);

}

// Spark i gang hele prosessen
initScoreboard();