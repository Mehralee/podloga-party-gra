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
          p.name.trim().length > 0,
      ),
    [state.players],
  );

  const [matches, setMatches] =
    useState<BracketMatch[]>([]);

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

    let saved = parsed;

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
        result?.matchId === matchId &&
        winnerId
      ) {
        const playedMatch =
          saved.find(
            (match) =>
              match.id === matchId,
          );

        if (
          playedMatch &&
          (
            winnerId ===
              playedMatch.player1Id ||
            winnerId ===
              playedMatch.player2Id
          )
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

    /*
     * Shuffle players once.
     *
     * Because the players are shuffled before the
     * bracket is created, any automatic bye will
     * effectively be random.
     */

    const shuffled =
      [...players].sort(
        () =>
          Math.random() -
          0.5,
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
                  10,
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
     * Mark match as playing.
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

    /*
     * Go to category selection.
     */

    navigate({
      to: "/category",
    });
  }

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
        "Zresetować turniej? Obecna siatka i wszystkie wyniki zostaną utracone.",
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
      return "???";
    }

    return (
      state.players.find(
        (p) =>
          p.id === id,
      )?.name ?? "???"
    );
  }

  /*
   * =====================================================
   * ROUND INFORMATION
   * =====================================================
   */

  const rounds = [
    ...new Set(
      matches.map(
        (m) =>
          m.round,
      ),
    ),
  ].sort(
    (a, b) =>
      a - b,
  );

  /*
   * =====================================================
   * RESPONSIVE BRACKET SCALE
   * =====================================================
   *
   * The frame remains fixed.
   *
   * More players = smaller cards/gaps.
   */

  const playerCount =
    players.length;

  const bracketScale =
    playerCount <= 8
      ? {
          card: "w-[250px]",
          column: "min-w-[250px]",
          gap: "gap-6",
          columnsGap: "gap-10",
          padding: "px-8",
          player: "px-3 py-2 text-sm",
          cardPadding: "p-3",
          title: "text-xl",
        }
      : playerCount <= 10
        ? {
            card: "w-[205px]",
            column: "min-w-[205px]",
            gap: "gap-4",
            columnsGap: "gap-6",
            padding: "px-5",
            player: "px-2 py-1.5 text-xs",
            cardPadding: "p-2",
            title: "text-lg",
          }
        : playerCount <= 12
          ? {
              card: "w-[185px]",
              column: "min-w-[185px]",
              gap: "gap-3",
              columnsGap: "gap-5",
              padding: "px-4",
              player:
                "px-2 py-1 text-[11px]",
              cardPadding: "p-2",
              title: "text-base",
            }
          : {
              card: "w-[165px]",
              column: "min-w-[165px]",
              gap: "gap-2",
              columnsGap: "gap-4",
              padding: "px-3",
              player:
                "px-1.5 py-1 text-[10px]",
              cardPadding: "p-1.5",
              title: "text-sm",
            };

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <Stage
      title="The Floor"
      subtitle="Turniej"
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
              RESETUJ TURNIEJ
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
                ? "LOSOWANIE..."
                : "LOSUJ TURNIEJ"}
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
                    LOSOWANIE GRACZY
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
                    GRACZY
                  </p>

                  <h2 className="text-gold-shine mt-4 font-display text-6xl uppercase">
                    Gotowi?
                  </h2>

                  <p className="mt-4 text-muted-foreground">
                    Cała siatka turniejowa
                    zostanie wylosowana.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          /*
           * =================================================
           * FIXED BRACKET FRAME
           * =================================================
           *
           * The frame itself never grows vertically.
           *
           * Horizontal scrolling is allowed inside the
           * frame if the screen is genuinely too narrow.
           */

          <div className="relative h-full w-full overflow-hidden">
            <div className="absolute inset-0 overflow-x-auto overflow-y-auto">
              <div
                className={`mx-auto flex min-h-full w-fit items-center ${bracketScale.columnsGap} ${bracketScale.padding} py-6`}
              >
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
                        className={`flex min-h-[85%] flex-col justify-center ${bracketScale.column}`}
                      >
                        <p
                          className={`mb-4 text-center font-display uppercase text-primary ${bracketScale.title}`}
                        >
                          {isFinal
                            ? "FINAŁ"
                            : `RUNDA ${round}`}
                        </p>

                        <div
                          className={`flex flex-col justify-center ${bracketScale.gap}`}
                        >
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
                                scale={
                                  bracketScale
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
  scale,
}: {
  match: BracketMatch;

  allMatches: BracketMatch[];

  playerName: (
    id: string | null,
  ) => string;

  onStart: () => void;

  onRemove: () => void;

  scale: {
    card: string;
    column: string;
    gap: string;
    columnsGap: string;
    padding: string;
    player: string;
    cardPadding: string;
    title: string;
  };
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
    <div
      className={`panel relative ${scale.card} ${scale.cardPadding}`}
    >
      <div className="space-y-1">
        <div
          className={`truncate rounded ${
            scale.player
          } ${
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

        <div className="text-center text-[9px] text-muted-foreground">
          VS
        </div>

        <div
          className={`truncate rounded ${
            scale.player
          } ${
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

      <div className="mt-2 flex gap-1">
        {canStart && (
          <Button
            className="min-w-0 flex-1 px-1 text-[10px]"
            size="sm"
            onClick={
              onStart
            }
          >
            ROZPOCZNIJ
          </Button>
        )}

        {match.status ===
          "playing" && (
          <div className="flex min-w-0 flex-1 items-center justify-center rounded bg-primary/10 px-1 py-1.5 text-[9px] uppercase text-primary">
            W TRAKCIE
          </div>
        )}

        {match.status ===
          "finished" && (
          <div className="flex min-w-0 flex-1 items-center justify-center rounded bg-primary/10 px-1 py-1.5 text-[9px] uppercase text-primary">
            ZAKOŃCZONE
          </div>
        )}

        {match.status !==
          "finished" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-7 shrink-0 px-0"
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

/**
 * Creates a single-elimination bracket without forcing
 * the player count to a power of two.
 *
 * Examples:
 *
 * 8 players:
 *   8 → 4 → 2 → 1
 *
 * 10 players:
 *   10 → 5 → 3 → 2 → 1
 *
 * 12 players:
 *   12 → 6 → 3 → 2 → 1
 *
 * 14 players:
 *   14 → 7 → 4 → 2 → 1
 *
 * 16 players:
 *   16 → 8 → 4 → 2 → 1
 *
 * When a round has an odd number of competitors,
 * the final unmatched position becomes an automatic BYE.
 *
 * Because players are shuffled before this function is
 * called, the player receiving the bye is effectively random.
 */

function createBracket(
  playerIds: string[],
): BracketMatch[] {
  const matches: BracketMatch[] =
    [];

  /*
   * FIRST ROUND
   *
   * Every two actual players make one real match.
   *
   * IMPORTANT:
   * We do NOT round the player count up to 8/16/etc.
   *
   * 10 players therefore creates exactly 5 matches.
   */

  const firstRoundCount =
    Math.ceil(
      playerIds.length / 2,
    );

  for (
    let i = 0;
    i < firstRoundCount;
    i++
  ) {
    const player1 =
      playerIds[i * 2] ??
      null;

    const player2 =
      playerIds[i * 2 + 1] ??
      null;

    /*
     * A bye can occur here only when there is an odd
     * number of players, e.g. 9 players.
     *
     * With 10 players there are exactly 5 real matches.
     */

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

  /*
   * SUBSEQUENT ROUNDS
   *
   * Do NOT require the number of matches to be even.
   *
   * ceil(previousCount / 2) means:
   *
   * 5 → 3
   * 3 → 2
   * 2 → 1
   */

  let previousCount =
    firstRoundCount;

  let round = 2;

  while (
    previousCount > 1
  ) {
    const count =
      Math.ceil(
        previousCount / 2,
      );

    for (
      let i = 0;
      i < count;
      i++
    ) {
      matches.push({
        id: `r${round}-${i}`,

        round,

        position: i,

        player1Id:
          null,

        player2Id:
          null,

        winnerId:
          null,

        status:
          "ready",
      });
    }

    previousCount =
      count;

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
    (a, b) =>
      a - b,
  );

  /*
   * Keep propagating until no slot changes.
   *
   * This also handles odd-sized rounds:
   *
   * 5 winners:
   *   match 1 vs 2
   *   match 3 vs 4
   *   match 5 gets BYE
   *
   * 3 winners:
   *   match 1 vs 2
   *   match 3 gets BYE
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
       * Put finished/bye winners into
       * the appropriate next-round slot.
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
       * Determine readiness / BYEs.
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
          nextMatch.position *
          2;

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
         * A missing feeder is considered already
         * resolved.
         *
         * This is what allows:
         *
         * 5 → 3
         * 3 → 2
         *
         * without creating fake matches.
         */

        const feeder1Resolved =
          !feeder1 ||
          !!feeder1.winnerId;

        const feeder2Resolved =
          !feeder2 ||
          !!feeder2.winnerId;

        /*
         * Still waiting for a previous match.
         */

        if (
          !feeder1Resolved ||
          !feeder2Resolved
        ) {
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
         *
         * This is a real match.
         */

        if (
          hasPlayer1 &&
          hasPlayer2
        ) {
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
         * Both feeders are resolved but only
         * one player exists.
         *
         * Automatic BYE.
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

        /*
         * Nothing available yet.
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