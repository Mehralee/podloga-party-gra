import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Stage } from "@/components/Stage";

import {
  ACTIVE_MATCH_KEY,
  useGame,
} from "@/game/store";

export const Route = createFileRoute(
  "/tournament",
)({
  component: TournamentPage,
});

const BRACKET_KEY =
  "the-floor-tournament-bracket-v1";

const RESULT_KEY =
  `${ACTIVE_MATCH_KEY}-result`;

type MatchStatus =
  | "ready"
  | "playing"
  | "finished"
  | "bye";

type BracketMatch = {
  id: string;
  round: number;
  position: number;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  status: MatchStatus;
};

function TournamentPage() {
  const { state } = useGame();
  const navigate = useNavigate();

  const players = useMemo(
    () =>
      state.players.filter(
        (p) =>
          p.name.trim()
            .length > 0,
      ),
    [state.players],
  );

  const [matches, setMatches] =
    useState<BracketMatch[]>(
      [],
    );

  const [drawing, setDrawing] =
    useState(false);

  const [drawComplete, setDrawComplete] =
    useState(false);

  const [drawnNames, setDrawnNames] =
    useState<string[]>([]);

  /*
   * =====================================================
   * LOAD TOURNAMENT
   * =====================================================
   */

  useEffect(() => {
    loadTournament();
  }, []);

  function loadTournament() {
    const raw =
      sessionStorage.getItem(
        BRACKET_KEY,
      );

    if (!raw) {
      return;
    }

    const parsed =
      safeParse<BracketMatch[]>(
        raw,
      );

    if (
      !parsed ||
      parsed.length === 0
    ) {
      return;
    }

    let saved =
      parsed;

    /*
     * Check for a result from the exact
     * match just played.
     */
    const activeRaw =
      sessionStorage.getItem(
        ACTIVE_MATCH_KEY,
      );

    const resultRaw =
      sessionStorage.getItem(
        RESULT_KEY,
      );

    if (
      activeRaw &&
      resultRaw
    ) {
      const active =
        safeParse<{
          matchId?: string;
          player1Id?: string;
          player2Id?: string;
        }>(activeRaw);

      const result =
        safeParse<{
          matchId?: string;
          winnerId?: string;
        }>(resultRaw);

      const matchId =
        active?.matchId;

      const winnerId =
        result?.winnerId;

      /*
       * Only consume a result belonging to
       * the currently active match.
       */
      if (
        matchId &&
        result?.matchId ===
          matchId &&
        winnerId
      ) {
        const playedMatch =
          saved.find(
            (match) =>
              match.id ===
              matchId,
          );

        if (
          playedMatch &&
          (winnerId ===
            playedMatch.player1Id ||
            winnerId ===
              playedMatch.player2Id)
        ) {
          saved =
            saved.map(
              (
                match,
              ): BracketMatch => {
                if (
                  match.id !==
                  matchId
                ) {
                  return match;
                }

                return {
                  ...match,
                  winnerId,
                  status:
                    "finished",
                };
              },
            );

          saved =
            resolveBracket(
              saved,
            );

          saveBracket(
            saved,
          );

          /*
           * Only NOW is it safe to delete
           * the temporary result.
           */
          sessionStorage.removeItem(
            ACTIVE_MATCH_KEY,
          );

          sessionStorage.removeItem(
            RESULT_KEY,
          );
        }
      }
    }

    setMatches(saved);
    setDrawComplete(
      true,
    );
  }

  /*
   * =====================================================
   * STORAGE
   * =====================================================
   */

  useEffect(() => {
    if (!drawComplete) {
      return;
    }

    saveBracket(matches);
  }, [
    matches,
    drawComplete,
  ]);

  /*
   * =====================================================
   * CREATE TOURNAMENT
   * =====================================================
   */

  function generateBracket() {
    if (
      drawing ||
      drawComplete ||
      players.length < 2
    ) {
      return;
    }

    sessionStorage.removeItem(
      ACTIVE_MATCH_KEY,
    );

    sessionStorage.removeItem(
      RESULT_KEY,
    );

    sessionStorage.removeItem(
      BRACKET_KEY,
    );

    setDrawing(true);
    setDrawComplete(
      false,
    );
    setMatches([]);

    const shuffled =
      [...players].sort(
        () => Math.random() - 0.5,
      );

    let index = 0;

    const animation =
      window.setInterval(
        () => {
          const random =
            [...players].sort(
              () =>
                Math.random() -
                0.5,
            );

          setDrawnNames(
            random
              .slice(
                0,
                Math.min(
                  players.length,
                  8,
                ),
              )
              .map(
                (p) =>
                  p.name,
              ),
          );

          index++;

          if (
            index >= 14
          ) {
            window.clearInterval(
              animation,
            );

            window.setTimeout(
              () => {
                let generated =
                  createBracket(
                    shuffled.map(
                      (p) =>
                        p.id,
                    ),
                  );

                generated =
                  resolveBracket(
                    generated,
                  );

                saveBracket(
                  generated,
                );

                setMatches(
                  generated,
                );

                setDrawnNames(
                  [],
                );

                setDrawing(
                  false,
                );

                setDrawComplete(
                  true,
                );
              },
              700,
            );
          }
        },
        180,
      );
  }

  /*
   * =====================================================
   * START EXACT MATCH
   * =====================================================
   */

  function startMatch(
    match: BracketMatch,
  ) {
    if (
      match.status !==
      "ready"
    ) {
      return;
    }

    if (
      !match.player1Id ||
      !match.player2Id
    ) {
      return;
    }

    /*
     * Clear ONLY the old result.
     */
    sessionStorage.removeItem(
      RESULT_KEY,
    );

    /*
     * Save exact match information.
     */
    sessionStorage.setItem(
      ACTIVE_MATCH_KEY,
      JSON.stringify({
        matchId:
          match.id,
        player1Id:
          match.player1Id,
        player2Id:
          match.player2Id,
      }),
    );

    /*
     * Mark exact match as playing.
     */
    setMatches(
      (current) => {
        const updated =
          current.map(
            (
              m,
            ): BracketMatch =>
              m.id ===
              match.id
                ? {
                    ...m,
                    status:
                      "playing",
                  }
                : m,
          );

        saveBracket(
          updated,
        );

        return updated;
      },
    );

    navigate({
      to: "/game",
    });
  }

  /*
   * =====================================================
   * REMOVE MATCH
   * =====================================================
   */

  function removeMatch(
    matchId: string,
  ) {
    setMatches(
      (current) => {
        const updated =
          current.filter(
            (m) =>
              m.id !==
              matchId,
          );

        saveBracket(
          updated,
        );

        return updated;
      },
    );
  }

  /*
   * =====================================================
   * RESET
   * =====================================================
   */

  function resetTournament() {
    const confirmed =
      window.confirm(
        "Reset the tournament? The current bracket and all results will be lost.",
      );

    if (!confirmed) {
      return;
    }

    sessionStorage.removeItem(
      BRACKET_KEY,
    );

    sessionStorage.removeItem(
      ACTIVE_MATCH_KEY,
    );

    sessionStorage.removeItem(
      RESULT_KEY,
    );

    setMatches([]);
    setDrawComplete(
      false,
    );
    setDrawing(false);
    setDrawnNames([]);

    navigate({
      to: "/tournament",
    });
  }

  /*
   * =====================================================
   * PLAYER NAME
   * =====================================================
   */

  function playerName(
    id: string | null,
  ) {
    if (!id) {
      return "TBD";
    }

    return (
      state.players.find(
        (p) =>
          p.id === id,
      )?.name ?? "TBD"
    );
  }

  const rounds = [
    ...new Set(
      matches.map(
        (m) =>
          m.round,
      ),
    ),
  ].sort(
    (a, b) => a - b,
  );

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <Stage
      title="The Floor"
      subtitle="Tournament"
      actions={
        <div className="flex items-center gap-3">
          {drawComplete && (
            <Button
              variant="outline"
              size="lg"
              onClick={
                resetTournament
              }
            >
              RESET TOURNAMENT
            </Button>
          )}

          {!drawComplete && (
            <Button
              size="lg"
              disabled={
                drawing ||
                players.length < 2
              }
              onClick={
                generateBracket
              }
            >
              {drawing
                ? "DRAWING..."
                : "DRAW TOURNAMENT"}
            </Button>
          )}
        </div>
      }
    >
      <div className="h-[calc(100dvh-10rem)] overflow-hidden">
        {!drawComplete ? (
          <div className="flex h-full items-center justify-center">
            <div className="panel gold-frame w-full max-w-5xl p-12 text-center">
              {drawing ? (
                <>
                  <p className="eyebrow">
                    RANDOMIZING PLAYERS
                  </p>

                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    {drawnNames.map(
                      (
                        name,
                        index,
                      ) => (
                        <div
                          key={`${name}-${index}`}
                          className="animate-in fade-in zoom-in-95 rounded-lg border border-primary/30 px-6 py-4 font-display text-2xl uppercase text-primary duration-200"
                        >
                          {name}
                        </div>
                      ),
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="eyebrow">
                    {players.length}{" "}
                    PLAYERS
                  </p>

                  <h2 className="text-gold-shine mt-4 font-display text-6xl uppercase">
                    Ready?
                  </h2>

                  <p className="mt-4 text-muted-foreground">
                    The complete tournament
                    bracket will be randomly
                    generated.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-x-auto overflow-y-hidden pb-4">
            <div className="flex h-full min-w-max items-center gap-10 px-8">
              {rounds.map(
                (round) => {
                  const roundMatches =
                    matches.filter(
                      (m) =>
                        m.round ===
                        round,
                    );

                  const isFinal =
                    round ===
                    rounds[
                      rounds.length -
                        1
                    ];

                  return (
                    <div
                      key={round}
                      className="flex h-full min-w-[250px] flex-col justify-center"
                    >
                      <p className="mb-5 text-center font-display text-xl uppercase text-primary">
                        {isFinal
                          ? "FINAL"
                          : `ROUND ${round}`}
                      </p>

                      <div className="flex flex-col justify-center gap-6">
                        {roundMatches.map(
                          (
                            match,
                          ) => (
                            <BracketCard
                              key={
                                match.id
                              }
                              match={
                                match
                              }
                              allMatches={
                                matches
                              }
                              playerName={
                                playerName
                              }
                              onStart={() =>
                                startMatch(
                                  match,
                                )
                              }
                              onRemove={() =>
                                removeMatch(
                                  match.id,
                                )
                              }
                            />
                          ),
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}
      </div>
    </Stage>
  );
}

/* =========================================================
   BRACKET CARD
   ========================================================= */

function BracketCard({
  match,
  allMatches,
  playerName,
  onStart,
  onRemove,
}: {
  match: BracketMatch;
  allMatches: BracketMatch[];
  playerName: (
    id: string | null,
  ) => string;
  onStart: () => void;
  onRemove: () => void;
}) {
  const canStart =
    match.status ===
      "ready" &&
    !!match.player1Id &&
    !!match.player2Id;

  const player1Advanced =
    isAdvancingPlayer(
      match,
      match.player1Id,
      allMatches,
    );

  const player2Advanced =
    isAdvancingPlayer(
      match,
      match.player2Id,
      allMatches,
    );

  const player1Won =
    match.winnerId ===
    match.player1Id;

  const player2Won =
    match.winnerId ===
    match.player2Id;

  return (
    <div className="panel relative w-[250px] p-3">
      <div className="space-y-1">
        <div
          className={`rounded px-3 py-2 ${
            player1Won ||
            player1Advanced
              ? "bg-primary/20 text-primary"
              : "bg-secondary"
          }`}
        >
          {playerName(
            match.player1Id,
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          VS
        </div>

        <div
          className={`rounded px-3 py-2 ${
            player2Won ||
            player2Advanced
              ? "bg-primary/20 text-primary"
              : "bg-secondary"
          }`}
        >
          {playerName(
            match.player2Id,
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {canStart && (
          <Button
            className="flex-1"
            size="sm"
            onClick={onStart}
          >
            START GAME
          </Button>
        )}

        {match.status ===
          "playing" && (
          <div className="flex flex-1 items-center justify-center rounded bg-primary/10 px-2 py-2 text-xs uppercase text-primary">
            IN GAME
          </div>
        )}

        {match.status ===
          "finished" && (
          <div className="flex flex-1 items-center justify-center rounded bg-primary/10 px-2 py-2 text-xs uppercase text-primary">
            FINISHED
          </div>
        )}

        {match.status !==
          "finished" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={
              onRemove
            }
          >
            ×
          </Button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ADVANCED PLAYER
   ========================================================= */

function isAdvancingPlayer(
  match: BracketMatch,
  playerId: string | null,
  allMatches: BracketMatch[],
): boolean {
  if (!playerId) {
    return false;
  }

  if (
    match.round <= 1
  ) {
    return false;
  }

  const previousPosition =
    match.position * 2;

  const previousMatch =
    allMatches.find(
      (m) =>
        m.round ===
          match.round - 1 &&
        m.position ===
          previousPosition,
    );

  const previousMatch2 =
    allMatches.find(
      (m) =>
        m.round ===
          match.round - 1 &&
        m.position ===
          previousPosition + 1,
    );

  return (
    previousMatch?.winnerId ===
      playerId ||
    previousMatch2?.winnerId ===
      playerId
  );
}

/* =========================================================
   CREATE BRACKET
   ========================================================= */

function createBracket(
  playerIds: string[],
): BracketMatch[] {
  const matches: BracketMatch[] =
    [];

  let size = 1;

  while (
    size < playerIds.length
  ) {
    size *= 2;
  }

  const slots: (
    | string
    | null
  )[] = [...playerIds];

  while (
    slots.length < size
  ) {
    slots.push(null);
  }

  const firstRoundCount =
    size / 2;

  for (
    let i = 0;
    i < firstRoundCount;
    i++
  ) {
    const player1 =
      slots[i * 2] ?? null;

    const player2 =
      slots[i * 2 + 1] ?? null;

    const isBye =
      !!player1 &&
      !player2;

    matches.push({
      id: `r1-${i}`,
      round: 1,
      position: i,

      player1Id:
        player1,

      player2Id:
        player2,

      winnerId:
        isBye
          ? player1
          : null,

      status:
        isBye
          ? "bye"
          : "ready",
    });
  }

  let previousCount =
    firstRoundCount;

  let round = 2;

  while (
    previousCount > 1
  ) {
    const count =
      previousCount / 2;

    for (
      let i = 0;
      i < count;
      i++
    ) {
      matches.push({
        id: `r${round}-${i}`,

        round,

        position: i,

        player1Id: null,

        player2Id: null,

        winnerId: null,

        status: "ready",
      });
    }

    previousCount = count;

    round++;
  }

  return matches;
}

/* =========================================================
   RESOLVE BRACKET
   ========================================================= */

function resolveBracket(
  input: BracketMatch[],
): BracketMatch[] {
  const matches =
    input.map(
      (
        match,
      ): BracketMatch => ({
        ...match,
      }),
    );

  const rounds = [
    ...new Set(
      matches.map(
        (match) =>
          match.round,
      ),
    ),
  ].sort(
    (a, b) => a - b,
  );

  /*
   * Keep propagating until no slot changes.
   */
  let changed = true;

  while (changed) {
    changed = false;

    for (
      let roundIndex = 0;
      roundIndex <
        rounds.length - 1;
      roundIndex++
    ) {
      const currentRound =
        rounds[roundIndex];

      const nextRound =
        rounds[
          roundIndex + 1
        ];

      const currentMatches =
        matches.filter(
          (match) =>
            match.round ===
            currentRound,
        );

      const nextMatches =
        matches.filter(
          (match) =>
            match.round ===
            nextRound,
        );

      /*
       * Put finished/bye winners into the
       * exact next-round slot.
       */
      for (
        const current of
          currentMatches
      ) {
        if (
          !current.winnerId
        ) {
          continue;
        }

        const nextPosition =
          Math.floor(
            current.position /
              2,
          );

        const nextMatch =
          nextMatches.find(
            (match) =>
              match.position ===
              nextPosition,
          );

        if (!nextMatch) {
          continue;
        }

        /*
         * Don't modify active or completed
         * next-round games.
         */
        if (
          nextMatch.status ===
            "playing" ||
          nextMatch.status ===
            "finished"
        ) {
          continue;
        }

        if (
          current.position %
            2 ===
          0
        ) {
          if (
            nextMatch.player1Id !==
            current.winnerId
          ) {
            nextMatch.player1Id =
              current.winnerId;

            changed = true;
          }
        } else {
          if (
            nextMatch.player2Id !==
            current.winnerId
          ) {
            nextMatch.player2Id =
              current.winnerId;

            changed = true;
          }
        }
      }

      /*
       * Determine readiness.
       */
      for (
        const nextMatch of
          nextMatches
      ) {
        if (
          nextMatch.status ===
            "playing" ||
          nextMatch.status ===
            "finished"
        ) {
          continue;
        }

        const feederPosition =
          nextMatch.position * 2;

        const feeder1 =
          currentMatches.find(
            (match) =>
              match.position ===
              feederPosition,
          );

        const feeder2 =
          currentMatches.find(
            (match) =>
              match.position ===
              feederPosition + 1,
          );

        /*
         * IMPORTANT:
         *
         * Missing winner means that feeder
         * has NOT resolved yet.
         */
        const feeder1Resolved =
          !feeder1 ||
          !!feeder1.winnerId;

        const feeder2Resolved =
          !feeder2 ||
          !!feeder2.winnerId;

        /*
         * Still waiting for a feeder.
         */
        if (
          !feeder1Resolved ||
          !feeder2Resolved
        ) {
          /*
           * Keep any winner from becoming a
           * fake BYE winner.
           */
          if (
            nextMatch.winnerId !==
            null
          ) {
            nextMatch.winnerId =
              null;

            changed = true;
          }

          if (
            nextMatch.status !==
            "ready"
          ) {
            nextMatch.status =
              "ready";

            changed = true;
          }

          continue;
        }

        const hasPlayer1 =
          !!nextMatch.player1Id;

        const hasPlayer2 =
          !!nextMatch.player2Id;

        /*
         * Both actual players are available.
         */
        if (
          hasPlayer1 &&
          hasPlayer2
        ) {
          /*
           * This is a real match, so it cannot
           * already have a winner.
           */
          if (
            nextMatch.winnerId !==
            null
          ) {
            nextMatch.winnerId =
              null;

            changed = true;
          }

          if (
            nextMatch.status !==
            "ready"
          ) {
            nextMatch.status =
              "ready";

            changed = true;
          }

          continue;
        }

        /*
         * Both feeder matches are resolved
         * but only one player exists:
         * genuine BYE.
         */
        if (
          hasPlayer1 ||
          hasPlayer2
        ) {
          const byeWinner =
            nextMatch.player1Id ??
            nextMatch.player2Id;

          if (
            nextMatch.winnerId !==
            byeWinner
          ) {
            nextMatch.winnerId =
              byeWinner;

            changed = true;
          }

          if (
            nextMatch.status !==
            "bye"
          ) {
            nextMatch.status =
              "bye";

            changed = true;
          }

          continue;
        }

        if (
          nextMatch.winnerId !==
          null
        ) {
          nextMatch.winnerId =
            null;

          changed = true;
        }
      }
    }
  }

  return matches;
}

/* =========================================================
   SAFE JSON
   ========================================================= */

function safeParse<T>(
  raw: string,
): T | null {
  try {
    return JSON.parse(
      raw,
    ) as T;
  } catch {
    return null;
  }
}

/* =========================================================
   STORAGE
   ========================================================= */

function saveBracket(
  matches: BracketMatch[],
) {
  try {
    sessionStorage.setItem(
      BRACKET_KEY,
      JSON.stringify(
        matches,
      ),
    );
  } catch {
    // Ignore storage errors.
  }
}