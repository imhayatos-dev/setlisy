"use client";

import BrandLogo from "@/components/BrandLogo";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { SetlistData, Song } from "@/types/setlist";

type AppMode = "home" | "setlist" | "stagePreset" | "stageEditor";
type VocalStyle = "pin" | "guitar";

type SaveStatus = "idle" | "saving" | "saved";

type StageItemType =
  | "vocal"
  | "guitar"
  | "bass"
  | "drums"
  | "keyboard"
  | "amp"
  | "monitor"
  | "mic"
  | "di"
  | "other";

type StageItem = {
  id: string;
  type: StageItemType;
  label: string;
  x: number;
  y: number;
  size: number;
};

type StageData = {
  title: string;
  artist: string;
  date: string;
  venue: string;
  notes: string;
  items: StageItem[];
};

const SETLIST_KEY = "setlist-note-data-v1";
const STAGE_KEY = "setlist-stageplot-data-v1";
const steps = ["概要", "セットリスト", "その他", "確認"];

const emptySong = (): Song => ({
  id: crypto.randomUUID(),
  title: "",
  duration: "",
  soundCue: "",
  lightingCue: "",
  memo: "",
});

const initialSetlist: SetlistData = {
  eventName: "",
  artistName: "",
  eventDate: "",
  venue: "",
  stageTime: "",
  contactName: "",
  songs: [emptySong()],
  overallSoundRequest: "",
  overallLightingRequest: "",
  notes: "",
};

const initialStage: StageData = {
  title: "",
  artist: "",
  date: "",
  venue: "",
  notes: "",
  items: [],
};

export default function Home() {
  const [mode, setMode] = useState<AppMode>("home");
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SetlistData>(initialSetlist);
  const [stage, setStage] = useState<StageData>(initialStage);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [members, setMembers] = useState(4);
  const [vocalStyle, setVocalStyle] = useState<VocalStyle>("pin");
  const [loaded, setLoaded] = useState(false);
  const [setlistSaveStatus, setSetlistSaveStatus] =
    useState<SaveStatus>("idle");

  const [stageSaveStatus, setStageSaveStatus] =
    useState<SaveStatus>("idle");

  useEffect(() => {
    try {
      const savedSetlist = localStorage.getItem(SETLIST_KEY);
      const savedStage = localStorage.getItem(STAGE_KEY);

      if (savedSetlist) {
        setData(JSON.parse(savedSetlist));
      }

      if (savedStage) {
        setStage(JSON.parse(savedStage));
      }
    } catch {
      localStorage.removeItem(SETLIST_KEY);
      localStorage.removeItem(STAGE_KEY);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    setSetlistSaveStatus("saving");

    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(SETLIST_KEY, JSON.stringify(data));
        setSetlistSaveStatus("saved");
      } catch {
        setSetlistSaveStatus("idle");
      }
    }, 750);

    return () => {
      window.clearTimeout(timer);
    };
  }, [data, loaded]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    setStageSaveStatus("saving");

    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STAGE_KEY, JSON.stringify(stage));
        setStageSaveStatus("saved");
      } catch {
        setStageSaveStatus("idle");
      }
    }, 750);

    return () => {
      window.clearTimeout(timer);
    };
  }, [stage, loaded]);

  const totalMinutes = useMemo(() => {
    return data.songs.reduce((sum, song) => {
      const [minutes = "0", seconds = "0"] = song.duration.split(":");

      return (
        sum +
        Number(minutes || 0) +
        Number(seconds || 0) / 60
      );
    }, 0);
  }, [data.songs]);

  const updateField = (field: keyof SetlistData, value: string) => {
    setData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateSong = (
    id: string,
    field: keyof Song,
    value: string,
  ) => {
    setData((previous) => ({
      ...previous,
      songs: previous.songs.map((song) =>
        song.id === id ? { ...song, [field]: value } : song,
      ),
    }));
  };

  const moveSong = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= data.songs.length) {
      return;
    }

    const songs = [...data.songs];
    [songs[index], songs[nextIndex]] = [songs[nextIndex], songs[index]];

    setData((previous) => ({
      ...previous,
      songs,
    }));
  };

  const removeSong = (id: string) => {
    setData((previous) => ({
      ...previous,
      songs:
        previous.songs.length === 1
          ? previous.songs
          : previous.songs.filter((song) => song.id !== id),
    }));
  };

  const resetSetlist = () => {
    localStorage.removeItem(SETLIST_KEY);
    setData({
      ...initialSetlist,
      songs: [emptySong()],
    });
    setStep(0);
  };

  if (mode === "home") {
    return (
      <HomeMenu
        onSetlist={() => setMode("setlist")}
        onStage={() => setMode("stagePreset")}
      />
    );
  }

  if (mode === "stagePreset") {
    return (
      <PresetScreen
        members={members}
        setMembers={setMembers}
        vocalStyle={vocalStyle}
        setVocalStyle={setVocalStyle}
        onBack={() => setMode("home")}
        onCreate={() => {
          setStage((previous) => ({
            ...previous,
            items: createPreset(members, vocalStyle),
          }));
          setMode("stageEditor");
        }}
        onBlank={() => {
          setStage((previous) => ({
            ...previous,
            items: [],
          }));
          setMode("stageEditor");
        }}
      />
    );
  }

  if (mode === "stageEditor") {
    return (
      <StageEditor
        stage={stage}
        setStage={setStage}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        onBack={() => setMode("stagePreset")}
      />
    );
  }

  return (
    <main className="shell">

      
      <header className="appHeader noPrint">
        <div>
  <BrandLogo compact />
</div>

        <div className="headerActions">
          <button
            className="ghostButton"
            onClick={() => setMode("home")}
          >
            メニュー
          </button>

          <button
            className="ghostButton"
            onClick={resetSetlist}
          >
            最初から作る
          </button>
        </div>
      </header>

      <nav className="steps noPrint" aria-label="作成手順">
        {steps.map((label, index) => (
          <button
            key={label}
            className={
              index === step
                ? "step active"
                : index < step
                  ? "step done"
                  : "step"
            }
            onClick={() => setStep(index)}
          >
            <span>{index + 1}</span>
            {label}
          </button>
        ))}
      </nav>

      <section className="panel">
        {step === 0 && (
          <div className="sectionContent">
            <SectionTitle
              number="01"
              title="イベント概要"
              text="出演情報と連絡先を入力します。"
            />

            <div className="formGrid">
              <Field
                label="イベント名"
                value={data.eventName}
                onChange={(value) => updateField("eventName", value)}
              />

              <Field
                label="アーティスト名"
                value={data.artistName}
                onChange={(value) => updateField("artistName", value)}
              />

              <Field
                label="開催日"
                type="date"
                value={data.eventDate}
                onChange={(value) => updateField("eventDate", value)}
              />

              <Field
                label="会場"
                value={data.venue}
                onChange={(value) => updateField("venue", value)}
              />

              <Field
                label="出演時間"
                value={data.stageTime}
                onChange={(value) => updateField("stageTime", value)}
              />

              <Field
                label="担当者・連絡先"
                value={data.contactName}
                onChange={(value) => updateField("contactName", value)}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="sectionContent">
            <SectionTitle
              number="02"
              title="セットリスト"
              text="曲順・尺・PA・照明のきっかけをまとめます。"
            />

            <div className="songList">
              {data.songs.map((song, index) => (
                <article
                  className="songCard"
                  key={song.id}
                >
                  <div className="songNumber">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="songFields">
                    <Field
                      label="曲名"
                      value={song.title}
                      onChange={(value) =>
                        updateSong(song.id, "title", value)
                      }
                    />

                    <Field
                      label="演奏時間"
                      value={song.duration}
                      onChange={(value) =>
                        updateSong(song.id, "duration", value)
                      }
                    />

                    <Field
                      label="音響・キッカケ"
                      value={song.soundCue}
                      onChange={(value) =>
                        updateSong(song.id, "soundCue", value)
                      }
                    />

                    <Field
                      label="照明"
                      value={song.lightingCue}
                      onChange={(value) =>
                        updateSong(song.id, "lightingCue", value)
                      }
                    />

                    <label className="field fullWidth">
                      <span>メモ</span>
                      <textarea
                        value={song.memo}
                        onChange={(event) =>
                          updateSong(song.id, "memo", event.target.value)
                        }
                      />
                    </label>
                  </div>

                  <div className="songActions noPrint">
                    <button
                      onClick={() => moveSong(index, -1)}
                      disabled={index === 0}
                      aria-label="上へ移動"
                    >
                      ↑
                    </button>

                    <button
                      onClick={() => moveSong(index, 1)}
                      disabled={index === data.songs.length - 1}
                      aria-label="下へ移動"
                    >
                      ↓
                    </button>

                    <button
                      className="danger"
                      onClick={() => removeSong(song.id)}
                      aria-label="曲を削除"
                    >
                      ×
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <button
              className="addButton noPrint"
              onClick={() =>
                setData((previous) => ({
                  ...previous,
                  songs: [...previous.songs, emptySong()],
                }))
              }
            >
              ＋ 曲を追加
            </button>

            <div className="summaryBar">
              <span>{data.songs.length} SONGS</span>
              <strong>
                {Math.floor(totalMinutes)}分{" "}
                {Math.round((totalMinutes % 1) * 60)}秒
              </strong>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="sectionContent">
            <SectionTitle
              number="03"
              title="全体指示・特記事項"
              text="共通事項を記載します。"
            />

            <div className="stack">
              <TextArea
                label="音響への全体要望"
                value={data.overallSoundRequest}
                onChange={(value) =>
                  updateField("overallSoundRequest", value)
                }
              />

              <TextArea
                label="照明への全体要望"
                value={data.overallLightingRequest}
                onChange={(value) =>
                  updateField("overallLightingRequest", value)
                }
              />

              <TextArea
                label="その他・特記事項"
                value={data.notes}
                onChange={(value) => updateField("notes", value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <SetlistPreview
            data={data}
            totalMinutes={totalMinutes}
          />
        )}
      </section>

      <footer className="bottomNav noPrint">
        <button
          className="secondaryButton"
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          戻る
        </button>

        {step < 3 ? (
          <button
            className="primaryButton"
            onClick={() => setStep((current) => Math.min(3, current + 1))}
          >
            次へ
          </button>
        ) : (
          <button
            className="primaryButton"
            onClick={() => window.print()}
          >
            印刷・PDF保存
          </button>
        )}
      </footer>
    </main>
  );
}

function HomeMenu({
  onSetlist,
  onStage,
}: {
  onSetlist: () => void;
  onStage: () => void;
}) {
  return (
    <main className="homeShell">
     <div className="homeIntro">
  <BrandLogo />
  <p>作りたい資料を選んでください。</p>
</div>

      <div className="modeGrid">
        <button
          className="modeCard"
          onClick={onSetlist}
        >
          <span>01</span>
          <h2>セットリスト</h2>
          <p>曲順、音響、照明、メモをまとめてA4横で出力。</p>
        </button>

        <button
          className="modeCard"
          onClick={onStage}
        >
          <span>02</span>
          <h2>セット図</h2>
          <p>プリセットまたは白紙から、自由にステージ配置を作成。</p>
        </button>
      </div>
    </main>
  );
}

function PresetScreen({
  members,
  setMembers,
  vocalStyle,
  setVocalStyle,
  onBack,
  onCreate,
  onBlank,
}: {
  members: number;
  setMembers: (members: number) => void;
  vocalStyle: VocalStyle;
  setVocalStyle: (style: VocalStyle) => void;
  onBack: () => void;
  onCreate: () => void;
  onBlank: () => void;
}) {
  return (
    <main className="shell">
      <header className="simpleHeader">
        <div>
  <BrandLogo compact />
  <p className="eyebrow">STAGE PLOT</p>
  <h1>セット図</h1>
</div>

        <button
          className="ghostButton"
          onClick={onBack}
        >
          メニューへ
        </button>
      </header>

      <section className="panel sectionContent">
        <SectionTitle
          number="01"
          title="プリセットを選択"
          text="人数を選び、4人以上はボーカル形態も選択します。"
        />

        <div className="presetNumbers">
          {[1, 2, 3, 4, 5].map((memberCount) => (
            <button
              key={memberCount}
              className={
                members === memberCount
                  ? "presetButton active"
                  : "presetButton"
              }
              onClick={() => setMembers(memberCount)}
            >
              {memberCount}人
            </button>
          ))}
        </div>

        {members >= 4 && (
          <div className="vocalChoice">
            <button
              className={
                vocalStyle === "pin"
                  ? "choice active"
                  : "choice"
              }
              onClick={() => setVocalStyle("pin")}
            >
              <strong>ピンボーカル</strong>
              <span>ボーカル専任</span>
            </button>

            <button
              className={
                vocalStyle === "guitar"
                  ? "choice active"
                  : "choice"
              }
              onClick={() => setVocalStyle("guitar")}
            >
              <strong>ギターボーカル</strong>
              <span>Voがギター兼任</span>
            </button>
          </div>
        )}

        <div className="presetActions">
          <button
            className="primaryButton"
            onClick={onCreate}
          >
            このプリセットで作る
          </button>

          <button
            className="secondaryButton"
            onClick={onBlank}
          >
            白紙から作る
          </button>
        </div>
      </section>
    </main>
  );
}

function StageEditor({
  stage,
  setStage,
  selectedId,
  setSelectedId,
  onBack,
}: {
  stage: StageData;
  setStage: (
    value: StageData | ((previous: StageData) => StageData),
  ) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onBack: () => void;
}) {
  const selectedItem = stage.items.find(
    (item) => item.id === selectedId,
  );

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    dx: number;
    dy: number;
  } | null>(null);

  const addItem = (type: StageItemType) => {
    const item: StageItem = {
      id: crypto.randomUUID(),
      type,
      label: defaultLabel(type),
      x: 50,
      y: 50,
      size: 1,
    };

    setStage((previous) => ({
      ...previous,
      items: [...previous.items, item],
    }));

    setSelectedId(item.id);
  };

  const startDragging = (
    event: ReactPointerEvent,
    id: string,
  ) => {
    const canvas = canvasRef.current?.getBoundingClientRect();
    const item = stage.items.find((stageItem) => stageItem.id === id);

    if (!canvas || !item) {
      return;
    }

    dragRef.current = {
      id,
      dx: event.clientX - (canvas.left + (item.x / 100) * canvas.width),
      dy: event.clientY - (canvas.top + (item.y / 100) * canvas.height),
    };

    setSelectedId(id);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveItem = (event: ReactPointerEvent) => {
    const dragging = dragRef.current;
    const canvas = canvasRef.current?.getBoundingClientRect();

    if (!dragging || !canvas) {
      return;
    }

    const x = Math.max(
      3,
      Math.min(
        97,
        ((event.clientX - dragging.dx - canvas.left) / canvas.width) * 100,
      ),
    );

    const y = Math.max(
      5,
      Math.min(
        95,
        ((event.clientY - dragging.dy - canvas.top) / canvas.height) * 100,
      ),
    );

    setStage((previous) => ({
      ...previous,
      items: previous.items.map((item) =>
        item.id === dragging.id ? { ...item, x, y } : item,
      ),
    }));
  };

  const stopDragging = () => {
    dragRef.current = null;
  };

  const updateSelectedItem = (
    changes: Partial<StageItem>,
  ) => {
    if (!selectedItem) {
      return;
    }

    setStage((previous) => ({
      ...previous,
      items: previous.items.map((item) =>
        item.id === selectedItem.id
          ? { ...item, ...changes }
          : item,
      ),
    }));
  };

  const deleteSelectedItem = () => {
    if (!selectedItem) {
      return;
    }

    setStage((previous) => ({
      ...previous,
      items: previous.items.filter(
        (item) => item.id !== selectedItem.id,
      ),
    }));

    setSelectedId(null);
  };

  const itemTypes: StageItemType[] = [
    "vocal",
    "guitar",
    "bass",
    "drums",
    "keyboard",
    "amp",
    "monitor",
    "mic",
    "di",
    "other",
  ];

  return (
    <main className="stageApp">
      <header className="stageToolbar noPrint">
        <button
          className="ghostButton"
          onClick={onBack}
        >
          プリセットへ
        </button>

        <strong>セット図エディター</strong>

        <button
          className="primaryButton"
          onClick={() => window.print()}
        >
          印刷・PDF保存
        </button>
      </header>

      <div className="stageWorkspace">
        <aside className="partsPanel noPrint">
          <h2>パーツ追加</h2>

          {itemTypes.map((type) => (
            <button
              key={type}
              onClick={() => addItem(type)}
            >
              ＋ {defaultLabel(type)}
            </button>
          ))}
        </aside>

        <section className="stageDocument">
          <div className="stageMeta">
            <Field
              label="イベント名"
              value={stage.title}
              onChange={(value) =>
                setStage((previous) => ({
                  ...previous,
                  title: value,
                }))
              }
            />

            <Field
              label="アーティスト名"
              value={stage.artist}
              onChange={(value) =>
                setStage((previous) => ({
                  ...previous,
                  artist: value,
                }))
              }
            />

            <Field
              label="日付"
              type="date"
              value={stage.date}
              onChange={(value) =>
                setStage((previous) => ({
                  ...previous,
                  date: value,
                }))
              }
            />

            <Field
              label="会場"
              value={stage.venue}
              onChange={(value) =>
                setStage((previous) => ({
                  ...previous,
                  venue: value,
                }))
              }
            />
          </div>

          <div className="stagePrintHeader">
            <div>
              <p>STAGE PLOT</p>
              <h2>{stage.title || "イベント名"}</h2>
            </div>

            <div>
              <strong>{stage.artist || "アーティスト名"}</strong>
              <span>{stage.date || "DATE"}</span>
              <span>{stage.venue || "VENUE"}</span>
            </div>
          </div>

          <div
            ref={canvasRef}
            className="stageCanvas"
            onPointerMove={moveItem}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onClick={() => setSelectedId(null)}
          >
            <div className="backLabel">STAGE BACK</div>

            {stage.items.map((item) => (
              <button
                key={item.id}
                className={[
                  "stageItem",
                  `type-${item.type}`,
                  selectedId === item.id ? "selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: `translate(-50%, -50%) scale(${item.size})`,
                }}
                onPointerDown={(event) => startDragging(event, item.id)}
                onClick={(event) => event.stopPropagation()}
              >
                <span className="itemIcon">
    <StageIcon type={item.type} />
</span>
                <span>{item.label}</span>
              </button>
            ))}

            <div className="audienceLabel">AUDIENCE</div>
          </div>

          <section className="stageNotes">
  <span className="stageNotesLabel">備考</span>

  {/* 画面編集用 */}
  <textarea
    className="stageNotesInput noPrint"
    value={stage.notes}
    placeholder="機材、持ち込み、同期、転換などを入力"
    onChange={(event) =>
      setStage((previous) => ({
        ...previous,
        notes: event.target.value,
      }))
    }
  />

  {/* 印刷・PDF専用 */}
  <div className="stageNotesPrint">
    {stage.notes || "特記事項なし"}
  </div>
</section>
        </section>

        <aside className="propertyPanel noPrint">
          <h2>選択中のパーツ</h2>

          {selectedItem ? (
            <>
              <Field
                label="表示名"
                value={selectedItem.label}
                onChange={(value) =>
                  updateSelectedItem({ label: value })
                }
              />

              <label className="field">
                <span>サイズ</span>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.1"
                  value={selectedItem.size}
                  onChange={(event) =>
                    updateSelectedItem({
                      size: Number(event.target.value),
                    })
                  }
                />
              </label>

              <button
                className="deleteButton"
                onClick={deleteSelectedItem}
              >
                削除
              </button>
            </>
          ) : (
            <p>ステージ上のパーツをクリックしてください。</p>
          )}
        </aside>
      </div>
    </main>
  );
}

function createPreset(
  memberCount: number,
  vocalStyle: VocalStyle,
): StageItem[] {
  const makeItem = (
    type: StageItemType,
    label: string,
    x: number,
    y: number,
  ): StageItem => ({
    id: crypto.randomUUID(),
    type,
    label,
    x,
    y,
    size: 1,
  });

  if (memberCount === 1) {
    return [
      makeItem("vocal", "Vo", 50, 38),
      makeItem("guitar", "Gt / A.Gt", 50, 56),
      makeItem("monitor", "MON", 50, 75),
    ];
  }

  if (memberCount === 2) {
    return [
      makeItem("vocal", "Vo / Ba", 35, 42),
      makeItem("vocal", "Vo / Gt", 65, 42),
      makeItem("monitor", "MON", 35, 72),
      makeItem("monitor", "MON", 65, 72),
    ];
  }

  if (memberCount === 3) {
    return [
      makeItem("guitar", "Ba", 30, 45),
      makeItem("bass", "Gt / Vo", 70, 45),
      makeItem("drums", "Dr", 50, 22),
      makeItem("monitor", "MON", 30, 75),
      makeItem("monitor", "MON", 70, 75),
    ];
  }

  if (memberCount === 4 && vocalStyle === "pin") {
    return [
      makeItem("vocal", "Vo", 50, 52),
      makeItem("guitar", "Ba", 25, 42),
      makeItem("bass", "Gt", 75, 42),
      makeItem("drums", "Dr", 50, 20),
      makeItem("monitor", "MON", 50, 76),
    ];
  }

  if (memberCount === 4) {
    return [
      makeItem("guitar", "Ba", 25, 48),
      makeItem("guitar", "Gt / Vo", 50, 58),
      makeItem("bass", "Gt", 75, 48),
      makeItem("drums", "Dr", 50, 18),
      makeItem("monitor", "MON", 25, 76),
      makeItem("monitor", "MON", 75, 76),
    ];
  }

  if (memberCount === 5 && vocalStyle === "pin") {
    return [
      makeItem("vocal", "Vo", 50, 55),
      makeItem("guitar", "Ba", 20, 42),
      makeItem("guitar", "Gt2", 42, 35),
      makeItem("bass", "Gt", 80, 42),
      makeItem("drums", "Dr", 50, 18),
      makeItem("monitor", "MON", 50, 78),
    ];
  }

  return [
    makeItem("guitar", "Ba", 20, 48),
    makeItem("guitar", "Gt / Vo", 42, 50),
    makeItem("keyboard", "Key", 58, 36),
    makeItem("bass", "Gt", 80, 48),
    makeItem("drums", "Dr", 50, 16),
    makeItem("monitor", "MON", 20, 76),
    makeItem("monitor", "MON", 80, 76),
  ];
}

function defaultLabel(type: StageItemType) {
  const labels: Record<StageItemType, string> = {
    vocal: "Vocal",
    guitar: "Guitar",
    bass: "Bass",
    drums: "Drums",
    keyboard: "Keyboard",
    amp: "Amp",
    monitor: "Monitor",
    mic: "Mic",
    di: "DI",
    other: "Other",
  };

  return labels[type];
}

function StageIcon({
  type,
}: {
  type: StageItemType;
}) {
  switch (type) {
    case "mic":
  return (
    <img
      src="/icons/mic.png"
      alt="Mic"
      style={{
        width: 24,
        height: 24,
        objectFit: "contain",
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
    case "monitor":
      return (
        <svg
          width="34"
          height="24"
          viewBox="0 0 100 60"
          fill="none"
        >
          <path
            d="M5 10
               L95 10
               L65 45
               L35 45
               Z"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      );

    case "guitar":
      return <>🎸</>;

    case "bass":
      return <>🎸</>;

    case "drums":
      return <>🥁</>;

    case "keyboard":
      return <>🎹</>;

    case "vocal":
      return <>🎤</>;

    case "amp":
      return <>▣</>;

    case "di":
      return <>DI</>;

    default:
      return <>＋</>;
  }
}

function SectionTitle({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="sectionTitle">
      <span>{number}</span>

      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea
        className="largeTextarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SetlistPreview({
  data,
  totalMinutes,
}: {
  data: SetlistData;
  totalMinutes: number;
}) {
  return (
    <div className="preview">
      <div className="previewTopline">
        <div className="dateVenue">
          <div className="metaItem">
            <span className="metaLabel">日付</span>
            <strong>{data.eventDate || "DATE"}</strong>
          </div>

          <div className="metaDivider" />

          <div className="metaItem">
            <span className="metaLabel">会場</span>
            <strong>{data.venue || "VENUE"}</strong>
          </div>
        </div>

        <p className="setlistMark">SET LIST</p>
      </div>

      <div className="heroBoxes">
        <TitleBox
          label="イベント名"
          value={data.eventName || "イベント名"}
        />

        <TitleBox
          label="アーティスト名"
          value={data.artistName || "アーティスト名"}
        />
      </div>

      <div className="infoStrip">
        <span>STAGE {data.stageTime || "-"}</span>
        <span>CONTACT {data.contactName || "-"}</span>
        <span>
          TOTAL {Math.floor(totalMinutes)}:
          {String(Math.round((totalMinutes % 1) * 60)).padStart(2, "0")}
        </span>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>曲名</th>
              <th>TIME</th>
              <th>音響・キッカケ</th>
              <th>照明</th>
              <th>メモ</th>
            </tr>
          </thead>

          <tbody>
            {data.songs.map((song, index) => (
              <tr key={song.id}>
                <td>{index + 1}</td>
                <td>
                  <strong>{song.title || "未入力"}</strong>
                </td>
                <td>{song.duration || "-"}</td>
                <td>{song.soundCue || "-"}</td>
                <td>{song.lightingCue || "-"}</td>
                <td>{song.memo || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="previewNotes">
  <Note
    icon={<SpeakerIcon />}
    title="SOUND"
    value={data.overallSoundRequest}
  />

  <Note
    icon={<LightBulbIcon />}
    title="LIGHTING"
    value={data.overallLightingRequest}
  />

  <Note
    icon={<MemoIcon />}
    title="NOTES"
    value={data.notes}
  />
</div>
    </div>
  );
}

function TitleBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const length = [...value].length;

  const fontSize =
    length <= 6
      ? "4rem"
      : length <= 12
        ? "3.2rem"
        : length <= 20
          ? "2.4rem"
          : "1.8rem";

  return (
    <section className="titleBox">
      <span className="titleBoxLabel">{label}</span>

      <div
        className="titleBoxValue"
        style={{ fontSize }}
      >
        {value}
      </div>
    </section>
  );
}

function Note({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <section>
      <h3>
        <span className="noteIcon">
          {icon}
        </span>

        <span>{title}</span>
      </h3>

      <p>{value || "特記事項なし"}</p>
    </section>
  );
}

function SpeakerIcon() {
  return (
    <svg
      className="noteSvgIcon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 9V15H8L13 19V5L8 9H4Z"
        fill="currentColor"
      />

      <path
        d="M16 8.5C17.2 9.5 17.8 10.7 17.8 12C17.8 13.3 17.2 14.5 16 15.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M18.5 6C20.5 7.8 21.5 9.8 21.5 12C21.5 14.2 20.5 16.2 18.5 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LightBulbIcon() {
  return (
    <svg
      className="noteSvgIcon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.5 15.5C6.9 14.4 6 12.5 6 10.5C6 7.2 8.7 4.5 12 4.5C15.3 4.5 18 7.2 18 10.5C18 12.5 17.1 14.4 15.5 15.5C14.7 16.1 14.4 16.7 14.4 17.5H9.6C9.6 16.7 9.3 16.1 8.5 15.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M9.5 20H14.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M10 17.5H14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M12 1.5V2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="M4.5 4L5.3 4.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="M19.5 4L18.7 4.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MemoIcon() {
  return (
    <svg
      className="noteSvgIcon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 3H15L19 7V21H6V3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M15 3V7H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M9 11H16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M9 15H16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M9 19H13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}