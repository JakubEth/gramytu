import { useEffect, useState, useRef } from "react";
import TinderCard from "react-tinder-card";

// Funkcja licząca dystans w km na podstawie współrzędnych
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const defaultAvatar = username =>
  "https://ui-avatars.com/api/?name=" +
  encodeURIComponent(username || "U") +
  "&background=E0E7FF&color=3730A3&bold=true";

function getHotUsers(events) {
  const userStats = {};
  for (const ev of events) {
    let host = ev.hostId;
    let userId, username, avatar;
    if (!host) continue;
    if (typeof host === "object" && host !== null) {
      userId = host._id;
      username = host.username;
      avatar = host.avatar;
    } else {
      userId = host;
      username = null;
      avatar = null;
    }
    if (!userId) continue;
    const likesCount = Array.isArray(ev.likes) ? ev.likes.length : 0;
    const participantsCount = Array.isArray(ev.participants) ? ev.participants.length : 0;
    if (!userStats[userId]) {
      userStats[userId] = {
        likes: 0,
        participants: 0,
        username: username,
        avatar: avatar
      };
    }
    userStats[userId].likes += likesCount;
    userStats[userId].participants += participantsCount;
    if (username) userStats[userId].username = username;
    if (avatar) userStats[userId].avatar = avatar;
  }
  const sorted = Object.entries(userStats)
    .sort(([, a], [, b]) =>
      (b.likes + b.participants) - (a.likes + a.participants)
    )
    .slice(0, 5);
  return sorted.map(([userId, stats], i) => ({
    userId,
    username: stats.username || "Nieznany",
    avatar: stats.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(stats.username || "U")}&background=E0E7FF&color=3730A3&bold=true`,
    likes: stats.likes,
    participants: stats.participants,
    place: i + 1
  }));
}

export default function EventsTinder() {
  const [events, setEvents] = useState([]);
  const [lastDirection, setLastDirection] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const cardRefs = useRef([]);

  useEffect(() => {
    fetch("https://gramytu.onrender.com/events")
      .then(res => res.json())
      .then(data => {
        setEvents(data.reverse());
        setCurrentIdx(data.length - 1);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        err => setUserPosition(null)
      );
    }
  }, []);

  const onSwipe = (direction, eventTitle, idx) => {
    setLastDirection(direction);
    setCurrentIdx(idx - 1);
  };

  const swipe = dir => {
    if (currentIdx >= 0 && cardRefs.current[currentIdx]) {
      cardRefs.current[currentIdx].swipe(dir);
    }
  };

  // Najgorętsze eventy (top 5 po lajkach, potem uczestnikach)
  const hotEvents = [...events]
    .map(ev => ({
      ...ev,
      likesCount: Array.isArray(ev.likes) ? ev.likes.length : 0,
      participantsCount: Array.isArray(ev.participants) ? ev.participants.length : 0
    }))
    .sort((a, b) =>
      b.likesCount - a.likesCount ||
      b.participantsCount - a.participantsCount
    )
    .slice(0, 5);

  // Najgorętsi użytkownicy (top 5 po sumie lajków i uczestników)
  const hotUsers = getHotUsers(events);

  // Pastel palette
  const pastelRed = "#fecaca";
  const pastelBlue = "#bae6fd";
  const pastelGreen = "#bbf7d0";
  const pastelPurple = "#ddd6fe";
  const pastelYellow = "#fef9c3";
  const pastelBorder = "#e5e7eb";
  const pastelBg = "rgba(255,255,255,0.88)";
  const pastelShadow = "0 4px 24px 0 #cbd5e180";
  const pastelText = "#000000";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f1f5f9 0%, #fff 50%, #f3e8ff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "32px 0",
        gap: "32px"
      }}
    >
      {/* LEWA REKLAMA */}
      <div style={{
        width: 160,
        minWidth: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div style={{
          width: 160,
          height: 600,
          background: pastelBg,
          border: `2px solid ${pastelBorder}`,
          borderRadius: 24,
          boxShadow: pastelShadow,
          overflow: "hidden"
        }}>
          <video
            preload="none"
            poster="https://cdn.advertserve.com/images/dotcomconsultancy.advertserve.com/servlet/files/3170"
            width="100%"
            height="100%"
            autoPlay
            loop
            muted
            playsInline
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
          >
            <p>
              <a
                href="https://dolphin-anty.com/"
                target="_blank"
                rel="nofollow"
              >
                <img
                  src="https://cdn.advertserve.com/images/dotcomconsultancy.advertserve.com/servlet/files/3170"
                  border="0"
                  width="160"
                  height="600"
                  alt=""
                  style={{ display: "block" }}
                />
              </a>
            </p>
          </video>
        </div>
      </div>

      {/* NAJGORETSZE EVENTY */}
      <div style={{
        width: 260,
        minWidth: 180,
        marginTop: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end"
      }}>
        <div style={{
          width: 260,
          background: pastelBg,
          borderRadius: 24,
          boxShadow: pastelShadow,
          border: `1.5px solid ${pastelBorder}`,
          padding: "24px 20px 20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          <div style={{
            fontWeight: 800,
            fontSize: 20,
            color: pastelText,
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
            letterSpacing: 0.5
          }}>
            <span style={{fontSize: 26}}>🔥</span> Najgorętsze eventy
          </div>
          {hotEvents.map((ev, i) => (
            <div
              key={ev._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderRadius: 14,
                background: i === 0
                  ? pastelYellow
                  : i === 1
                  ? pastelRed
                  : i === 2
                  ? pastelBlue
                  : pastelPurple,
                border: `1.5px solid ${pastelBorder}`,
                boxShadow: i === 0 ? `0 2px 12px ${pastelYellow}` : "none"
              }}
            >
              <div style={{
                fontWeight: 900,
                fontSize: 22,
                color: pastelText,
                width: 34,
                textAlign: "center"
              }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: pastelText,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {ev.title}
                </div>
                <div style={{
                  fontSize: 13,
                  color: pastelText,
                  marginTop: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 10
                }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 2
                  }}>👍
                    <span style={{
                      fontWeight: 700,
                      color: pastelText
                    }}>{ev.likesCount}</span>
                  </span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 2
                  }}>👥
                    <span style={{
                      fontWeight: 700,
                      color: pastelText
                    }}>{ev.participantsCount}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SWIPE + DOLNY BANER */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: 420,
        minWidth: 320
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          color: pastelText,
          marginBottom: 18,
          letterSpacing: 0.5
        }}>
          Swipe'uj wydarzenia!
        </h1>
        <div className="relative w-[350px] h-[540px]">
          {events.map((ev, idx) => (
            <TinderCard
              key={ev._id}
              ref={el => cardRefs.current[idx] = el}
              onSwipe={dir => onSwipe(dir, ev.title, idx)}
              onCardLeftScreen={() => {}}
              preventSwipe={["up", "down"]}
            >
              <div
                className="absolute w-[340px] h-[520px] left-0 top-0 flex flex-col justify-between p-5"
                style={{
                  borderRadius: 28,
                  boxShadow: pastelShadow,
                  background: "#fff",
                  border: `1px solid ${pastelBorder}`,
                  zIndex: idx === currentIdx ? 2 : 1,
                  transform: `scale(${idx === currentIdx ? 1 : 0.96}) translateY(${(currentIdx-idx)*8}px)`,
                  transition: "transform 0.2s"
                }}
              >
                {/* ZDJĘCIE WYDARZENIA */}
                {ev.image && (
                  <div
                    style={{
                      borderRadius: 18,
                      overflow: "hidden",
                      boxShadow: "0 2px 12px #cbd5e180",
                      marginBottom: 10
                    }}
                  >
                    <img
                      src={ev.image}
                      alt="Zdjęcie wydarzenia"
                      className="w-full object-cover"
                      style={{ maxHeight: 160, minHeight: 100 }}
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: 20,
                      color: pastelText,
                      marginBottom: 2
                    }}>
                      {ev.title}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: pastelText,
                      marginBottom: 2
                    }}>
                      {ev.date?.slice(0, 10)} • {ev.location?.name}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: pastelText,
                      marginBottom: 2
                    }}>
                      {userPosition && ev.location && (
                        (() => {
                          const dist = getDistanceFromLatLonInKm(
                            userPosition[0],
                            userPosition[1],
                            ev.location.lat,
                            ev.location.lng
                          );
                          return `~${Math.round(dist)} km od Ciebie`;
                        })()
                      )}
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: pastelText,
                      marginBottom: 6
                    }}>
                      {ev.description}
                    </div>
                    {ev.tags?.length > 0 && (
                      <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                        marginBottom: 4
                      }}>
                        {ev.tags.map(tag => (
                          <span key={tag} style={{
                            background: pastelPurple,
                            color: pastelText,
                            fontSize: 12,
                            padding: "2px 8px",
                            borderRadius: 8
                          }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 8
                  }}>
                    <img
                      src={ev.hostId?.avatar || defaultAvatar(ev.hostId?.username || ev.host)}
                      alt={ev.hostId?.username || ev.host}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: `1.5px solid ${pastelBlue}`,
                        objectFit: "cover",
                        background: pastelBlue
                      }}
                    />
                    <div style={{ fontSize: 13, color: pastelText, fontWeight: 600 }}>
                      {ev.hostId?.username || ev.host}
                    </div>
                    <div style={{ fontSize: 13, color: pastelText }}>
                      👥 {ev.participants?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </TinderCard>
          ))}
          {/* Przyciski swipe */}
          {currentIdx >= 0 && (
            <div className="absolute left-0 right-0 flex justify-center gap-10 bottom-[-60px] z-10">
              <button
                onClick={() => swipe("left")}
                style={{
                  width: 56, height: 56,
                  background: pastelRed,
                  border: `2px solid ${pastelBorder}`,
                  color: pastelText,
                  borderRadius: "50%",
                  fontSize: 28,
                  fontWeight: 700,
                  boxShadow: pastelShadow,
                  cursor: "pointer"
                }}
                aria-label="Odrzuć"
              >
                ✖
              </button>
              <button
                onClick={() => swipe("right")}
                style={{
                  width: 56, height: 56,
                  background: pastelGreen,
                  border: `2px solid ${pastelBorder}`,
                  color: pastelText,
                  borderRadius: "50%",
                  fontSize: 28,
                  fontWeight: 700,
                  boxShadow: pastelShadow,
                  cursor: "pointer"
                }}
                aria-label="Polub"
              >
                ❤
              </button>
            </div>
          )}
        </div>
        {lastDirection && (
          <div style={{
            marginTop: 28,
            color: pastelText,
            fontSize: 17,
            fontWeight: 500
          }}>
            Ostatni swipe: <b>{lastDirection}</b>
          </div>
        )}
        {events.length === 0 && !loading && (
          <div style={{
            marginTop: 28,
            color: pastelText,
            fontSize: 16
          }}>
            Brak wydarzeń do swipe'owania.
          </div>
        )}

        {/* DOLNY BANER HORYZONTALNY */}
        <div style={{
          width: 460,
          maxWidth: "100vw",
          margin: "80px 0 0 0",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center"
        }}>
          <div style={{
            width: 468,
            height: 60,
            background: pastelBg,
            border: `2px solid ${pastelBorder}`,
            borderRadius: 18,
            boxShadow: pastelShadow,
            overflow: "hidden"
          }}>
            <video
              id="Video_11958089"
              preload="none"
              poster="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/11Feb25-PC-v.1.4-AdsGorilla-468x60.png"
              width="100%"
              height="100%"
              autoPlay
              loop
              muted
              playsInline
              style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
            >
              <source src="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/11Feb25-PC-v.1.4-AdsGorilla-468x60.mp4" type="video/mp4" />
              <p>
                <a
                  href="http://dotcomconsultancy.advertserve.com/servlet/click/zone?zid=2&amp;cid=1663&amp;mid=3936&amp;pid=0&amp;sid=15&amp;uuid=bb552a497cffc0161b11a3d58f697df0&amp;consent=true&amp;ip=45.134.212.71&amp;default=false&amp;random=11958089&amp;timestamp=20250604120747&amp;test=false&amp;resolution=998x785&amp;referrer=https%3A%2F%2Fblackhatworld.com%2F&amp;redirect=https%3A%2F%2Fads-gorilla.com%2F"
                  target="_blank"
                  rel="nofollow"
                >
                  <img
                    src="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/11Feb25-PC-v.1.4-AdsGorilla-468x60.png"
                    border="0"
                    width="468"
                    height="60"
                    alt=""
                    style={{ display: "block" }}
                  />
                </a>
              </p>
            </video>
          </div>
        </div>
      </div>

      {/* NAJGORETSI UŻYTKOWNICY */}
      <div style={{
        width: 260,
        minWidth: 180,
        marginTop: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start"
      }}>
        <div style={{
          width: 260,
          background: pastelBg,
          borderRadius: 24,
          boxShadow: pastelShadow,
          border: `1.5px solid ${pastelBorder}`,
          padding: "24px 20px 20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          <div style={{
            fontWeight: 800,
            fontSize: 20,
            color: pastelText,
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
            letterSpacing: 0.5
          }}>
            <span style={{fontSize: 26}}>🌟</span> Najgorętsi użytkownicy
          </div>
          {hotUsers.map((user, i) => (
            <div
              key={user.userId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderRadius: 14,
                background: i === 0
                  ? pastelGreen
                  : i === 1
                  ? pastelBlue
                  : i === 2
                  ? pastelPurple
                  : pastelYellow,
                border: `1.5px solid ${pastelBorder}`,
                boxShadow: i === 0 ? `0 2px 12px ${pastelGreen}` : "none"
              }}
            >
              <div style={{
                fontWeight: 900,
                fontSize: 22,
                color: pastelText,
                width: 34,
                textAlign: "center"
              }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </div>
              <img
                src={user.avatar}
                alt={user.username}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `1.5px solid ${pastelBorder}`,
                  background: pastelBlue
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: pastelText,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {user.username}
                </div>
                <div style={{
                  fontSize: 13,
                  color: pastelText,
                  marginTop: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 10
                }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 2
                  }}>👍
                    <span style={{
                      fontWeight: 700,
                      color: pastelText
                    }}>{user.likes}</span>
                  </span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 2
                  }}>👥
                    <span style={{
                      fontWeight: 700,
                      color: pastelText
                    }}>{user.participants}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRAWA REKLAMA */}
      <div style={{
        width: 160,
        minWidth: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div style={{
          width: 160,
          height: 600,
          background: pastelBg,
          border: `2px solid ${pastelBorder}`,
          borderRadius: 24,
          boxShadow: pastelShadow,
          overflow: "hidden"
        }}>
          <video
            preload="none"
            poster="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/30May25-160x600-BHW_6B.png"
            width="100%"
            height="100%"
            autoPlay
            loop
            muted
            playsInline
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/28Aug24-160x600-Banner03-s.mp4" type="video/mp4" />
            <p>
              <a
                href="https://proxidize.com/proxy-server/mobile-proxies/"
                target="_blank"
                rel="nofollow"
              >
                <img
                  src="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/30May25-160x600-BHW_6B.png"
                  border="0"
                  width="160"
                  height="600"
                  alt=""
                  style={{ display: "block" }}
                />
              </a>
            </p>
          </video>
        </div>
      </div>
    </div>
  );
}
