import fs from 'fs';

const path = './src/pages/Home.jsx';
let content = fs.readFileSync(path, 'utf8');

// The replacement code exactly as specified
const replacement = `            {[
              { id: "Pw1Fsj8SFBc", image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=600&h=1066&q=80" },
              { id: "RCTFnwe3K1s", image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=600&h=1066&q=80" },
              { id: "ypeZdqaHKTo", image: "https://images.unsplash.com/photo-1622630998477-20b41cd0e0b2?auto=format&fit=crop&w=600&h=1066&q=80" },
              { id: "tiUJixp-9w0", image: "https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=600&h=1066&q=80" },
              { id: "9dGW5lkYYU0", image: "https://images.unsplash.com/photo-1625806335347-195935061b47?auto=format&fit=crop&w=600&h=1066&q=80" }
            ].map((video, index) => (
              <div
                key={index}
                className="relative snap-start shrink-0 w-[80vw] sm:w-[320px] max-w-[320px] aspect-[9/16] bg-gray-900 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-cover bg-center"
                style={{ backgroundImage: \`url('\${video.image}')\` }}
              >
                {/* Fallback Overlay */}
                <div className="absolute inset-0 bg-black/40"></div>
                
                {/* User requested link removal here */}
              </div>
            ))}`;

const regex = /\{\[\s*\{\s*id:\s*"[^"]*",\s*title:\s*"[^"]*",\s*image:[^}]*},\s*\{\s*id:\s*"[^"]*",\s*title:\s*"[^"]*",\s*image:[^}]*},\s*\{\s*id:\s*"[^"]*",\s*title:\s*"[^"]*",\s*image:[^}]*},\s*\{\s*id:\s*"[^"]*",\s*title:\s*"[^"]*",\s*image:[^}]*},\s*\{\s*id:\s*"[^"]*",\s*title:\s*"[^"]*",\s*image:[^}]*}\s*\]\.map\(\(video,\s*index\)\s*=>\s*\(\s*<div[^>]*>\s*(?:\{\/\*\s*Fallback Overlay.*?\s*<\/div>\s*<iframe[^>]*>.*?<\/iframe>\s*|<div[^>]*>\s*\{\/\*\s*Fallback Overlay.*?\s*<\/div>\s*).*?<\/div>\s*\)\)/s;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content, 'utf8');
console.log('Video replacement applied!');
