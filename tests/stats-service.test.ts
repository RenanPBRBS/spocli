import { describe, expect, it } from "vitest";
import { countGenres } from "../src/services/stats-service.js";
import type { SpotifyArtist } from "../src/types/spotify.js";

describe("countGenres", () => {
  it("counts and sorts artist genres", () => {
    const artists = [
      artist("a", ["rock", "alternative"]),
      artist("b", ["rock"]),
      artist("c", ["pop"])
    ];

    expect(countGenres(artists)).toEqual([
      { genre: "rock", count: 2 },
      { genre: "alternative", count: 1 },
      { genre: "pop", count: 1 }
    ]);
  });
});

function artist(name: string, genres: string[]): SpotifyArtist {
  return {
    id: name,
    name,
    genres,
    external_urls: { spotify: `https://spotify.example/${name}` }
  };
}
