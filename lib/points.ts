// lib/points.ts
export type PointTask = {
    id: string;
    title: string;
    coords: { latitude: number; longitude: number };
    radiusMeters: number;
    question: string;
    answers: string[];
    reward: number;
  };
  
  export const POINTS: PointTask[] = [
    {
      id: "gd1",
      title: "Fontanna Neptuna (Długi Targ)",
      coords: { latitude: 54.34805, longitude: 18.65362 },
      radiusMeters: 60,
      question: "Kto jest przedstawiony na szczycie fontanny?",
      answers: ["neptun", "posejdon"],
      reward: 10,
    },
    {
      id: "gd2",
      title: "Bazylika Mariacka",
      coords: { latitude: 54.34934, longitude: 18.65288 },
      radiusMeters: 70,
      question: "Z jakiego materiału zbudowana jest bazylika? (jedno słowo)",
      answers: ["cegła", "cegla"],
      reward: 15,
    },
    {
      id: "gd3",
      title: "Żuraw nad Motławą",
      coords: { latitude: 54.34961, longitude: 18.6566 },
      radiusMeters: 60,
      question: "Do czego historycznie służył Żuraw? (jedno słowo)",
      answers: ["przeładunek", "zaladunek", "dźwig", "dzwig"],
      reward: 15,
    },
    {
      id: "gd4",
      title: "Muzeum II Wojny Światowej",
      coords: { latitude: 54.3606, longitude: 18.6577 },
      radiusMeters: 80,
      question: "Jaka liczba rzymska oznacza 'druga' w nazwie muzeum?",
      answers: ["ii", "2"],
      reward: 10,
    },
    {
      id: "gd5",
      title: "Dworzec Gdańsk Główny",
      coords: { latitude: 54.353, longitude: 18.646 },
      radiusMeters: 80,
      question: "Jak nazywa się środek transportu, który odjeżdża stąd najczęściej? (jedno słowo)",
      answers: ["pociąg", "pociag", "kolej"],
      reward: 10,
    },
    // 🔹 TESTOWY PUNKT WE WRZESZCZU
    {
      id: "gd-test",
      title: "Testowy Punkt – Wrzeszcz",
      coords: { latitude: 54.3122080, longitude: 18.5733228 },
      radiusMeters: 70,
      question: "To jest punkt testowy. Wpisz słowo 'test', aby zaliczyć zadanie.",
      answers: ["test"],
      reward: 5,
    },
    {
      id: "gd6",
      title: "Park Oliwski",
      coords: { latitude: 54.41025, longitude: 18.56195 },
      radiusMeters: 70,
      question: "Jakie zwierzęta można zobaczyć w stawie w Parku Oliwskim?",
      answers: ["kaczki", "kaczka"],
      reward: 10,
    },

  ];
  
  export const normalize = (s: string) =>
    s.normalize("NFKC").trim().toLowerCase();
  