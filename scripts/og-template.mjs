export const imageWidth = 1200;
export const imageHeight = 630;
export const titleBounds = { left: 56, top: 120, width: 992, height: 292 };

export const imageTemplate = ({ title, label, name, domain, fontSize, icon }) => ({
  type: "div",
  props: {
    lang: "ja-JP",
    style: {
      display: "flex",
      width: "100%",
      height: "100%",
      backgroundImage: "linear-gradient(135deg, #dce7f8 0%, #f1f5fb 55%, #d5e2f5 100%)",
      color: "#152239",
      fontFamily: "Noto Sans JP",
      fontWeight: 700,
      padding: 42,
    },
    children: {
      type: "div",
      props: {
        style: {
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
          border: "1px solid #dce3ed",
          borderRadius: 28,
          boxShadow: "0 12px 30px rgba(21, 34, 57, 0.10)",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                position: "absolute",
                left: 56,
                top: 38,
                alignItems: "center",
                gap: 16,
                fontSize: 20,
                color: "#2158c7",
                letterSpacing: 4,
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { width: 6, height: 24, borderRadius: 3, backgroundColor: "#2158c7" },
                  },
                },
                { type: "div", props: { children: label } },
              ],
            },
          },
          {
            type: "div",
            props: {
              id: "title",
              style: {
                position: "absolute",
                left: titleBounds.left,
                top: titleBounds.top,
                width: titleBounds.width,
                fontSize,
                lineHeight: 1.35,
                wordBreak: "break-all",
              },
              children: title,
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                position: "absolute",
                left: 56,
                right: 56,
                bottom: 30,
                paddingTop: 22,
                borderTop: "1px solid #dce3ed",
                justifyContent: "space-between",
                alignItems: "center",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { display: "flex", alignItems: "center", gap: 16 },
                    children: [
                      {
                        type: "img",
                        props: {
                          src: icon,
                          width: 52,
                          height: 52,
                          style: { borderRadius: 14, objectFit: "cover" },
                        },
                      },
                      { type: "div", props: { style: { fontSize: 26 }, children: `${name}.` } },
                    ],
                  },
                },
                {
                  type: "div",
                  props: { style: { fontSize: 18, color: "#53627a" }, children: domain },
                },
              ],
            },
          },
        ],
      },
    },
  },
});
