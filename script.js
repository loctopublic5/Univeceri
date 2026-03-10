let isDataLoaded = false;
let uniData = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
});

async function loadData() {
    try {
        const response = await fetch('data.json');
        let text = await response.text();

        try {
            const json = JSON.parse(text);
            uniData = Array.isArray(json) ? json : (json.universities || []);
        } catch (e) {
            console.warn("JSON error, trying to fix...", e);
            text = text.replace(/}\s*{/g, "},{").replace(/\u00A0/g, ' ');
            const json = JSON.parse(text);
            uniData = Array.isArray(json) ? json : (json.universities || []);
        }
        isDataLoaded = true;
        renderSchoolPreview();
    } catch (error) {
        console.error("Failed to load data:", error);
        showCatMessage("Ui Dororo chưa tải được dữ liệu rồi, chờ xíu nha bạn Rô! 🥺");
    }
}

function setupEventListeners() {
    const calcBtn = document.getElementById('calc-btn');
    const backBtn = document.getElementById('back-btn');
    const inputs = document.querySelectorAll('input[type="number"]');

    let shownLowScoreWarn = false; // chỉ hiển thị 1 lần
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            showCatMessage("Dororo đang xem Rô nhập điểm nè... 💕");
        });

        input.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            if (val > 10) {
                e.target.value = 10;
                showCatMessage("Khoan đã Rô ơi, điểm tối đa là 10 thôi nè! Rô gõ nhầm rồi phải không? 🤭", 4000);
            } else if (val === 10) {
                showCatMessage("Oa! 10 điểm trọn vẹn! Rô giỏi quá đi! 🎉", 4000);
            } else if (val < 0) {
                e.target.value = 0;
                showCatMessage("Điểm nhỏ hơn 0 là sao ta? Rô kiểm tra lại nha! 😸", 4000);
            } else if (val > 0 && val < 5 && !shownLowScoreWarn) {
                // An ủi ngay khi nhập, chỉ một lần duy nhất
                shownLowScoreWarn = true;
                showCatMessage("Rô ơi, không sao đâu nha! Dù điểm nào Dororo và anh Lộc vẫn luôn ủng hộ Rô 💕", 5000);
            } else if (val >= 5) {
                // Reset cờ khi Rô sửa lại điểm tốt hơn
                shownLowScoreWarn = false;
            }
        });

        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') calcBtn.click();
        });
    });

    calcBtn.addEventListener('click', () => {
        if (!isDataLoaded) {
            showCatMessage("Đợi chút nha bạn Rô, dữ liệu đang tải... ⏳");
            return;
        }

        const van = parseFloat(document.getElementById('score-van').value) || 0;
        const toan = parseFloat(document.getElementById('score-toan').value) || 0;
        const ly = parseFloat(document.getElementById('score-gdktpl').value) || 0;
        const dia = parseFloat(document.getElementById('score-dia').value) || 0;

        // Tính theo khối C04 và C14 như yêu cầu
        const c04 = van + toan + dia;
        const c05 = van + toan + ly;

        showCatMessage("Dororo đang tính toán cho bạn Rô nè... 💕");

        calcBtn.disabled = true;
        calcBtn.innerHTML = "Đang chờ phép thuật... ✨";

        setTimeout(() => {
            processResults(c04, c05);
            document.getElementById('input-section').classList.remove('active');
            document.getElementById('input-section').classList.add('hidden');
            document.getElementById('result-section').classList.add('active');
            document.getElementById('result-section').classList.remove('hidden');

            calcBtn.disabled = false;
            calcBtn.innerHTML = "Xem điều bất ngờ 🪄";
        }, 1500);
    });


    backBtn.addEventListener('click', () => {
        document.getElementById('result-section').classList.remove('active');
        document.getElementById('result-section').classList.add('hidden');
        document.getElementById('input-section').classList.add('active');
        document.getElementById('input-section').classList.remove('hidden');

        resetCat();
        showCatMessage("Nhập lại điểm hả bạn Rô? Dororo chờ nè! 🥰");
    });

    const pixelCat = document.getElementById('pixel-cat');
    let dororoMessages = [
        "Rô cứ gõ đi, anh Lộc dặn Dororo phải trông Rô cẩn thận đó!",
        "Meo meo~ Đừng lo lắng rớt đại học nhé, có anh Lộc mà!",
        "Cố lên Rô ơi, đại học thẳng tiến!",
        "Lựa chọn cẩn thận vào nha, tương lai rộng mở phía trước đấy 💕",
        "Bài mà khó quá thì phải báo tuiii nha! Để tui cơ cấu choa. Meoheheheh 😽",
        "Anh Lộc dặn tui là, Rô có gì cũng phải nó anhhhh đó 🎈",
    ];

    pixelCat.addEventListener('click', () => {
        if (pixelCat.classList.contains('toolbar-pos')) {
            pixelCat.classList.remove('toolbar-pos');
            pixelCat.classList.add('corner-pos');
            showCatMessage("Dororo sẵn sàng hỗ trợ Rô rồi đây! 🎉", 5000);
        } else {
            // Click khi đã ở góc
            showCatMessage(dororoMessages[Math.floor(Math.random() * dororoMessages.length)], 4000);
        }
    });

    pixelCat.addEventListener('mouseenter', () => {
        if (pixelCat.classList.contains('corner-pos')) {
            // Chỉ đổi tooltip nếu chưa có text quan trọng
            const bubble = document.getElementById('cat-bubble');
            if (!bubble.classList.contains('show')) {
                showCatMessage(dororoMessages[Math.floor(Math.random() * dororoMessages.length)], 3000);
            }
        }
    });
}
// Render input table preview
function renderSchoolPreview() {
    const previewContainer = document.getElementById('school-preview-list');
    if (!previewContainer) return;

    let sortedData = [...uniData];
    sortedData.sort((a, b) => {
        let nameA = (a.university_name || a.name || "").toLowerCase();
        let nameB = (b.university_name || b.name || "").toLowerCase();
        let hotA = nameA.includes("sư phạm") || nameA.includes("kinh tế") || nameA.includes("ngân hàng") || nameA.includes("báo chí");
        let hotB = nameB.includes("sư phạm") || nameB.includes("kinh tế") || nameB.includes("ngân hàng") || nameB.includes("báo chí");

        if (hotA && !hotB) return -1;
        if (!hotA && hotB) return 1;
        return 0;
    });

    let html = '';
    sortedData.forEach(uni => {
        let depts = uni.departments || uni.majors || [];
        let uniNameLowerCase = (uni.university_name || uni.name || "").toLowerCase();
        let isHot = uniNameLowerCase.includes("sư phạm") || uniNameLowerCase.includes("kinh tế") || uniNameLowerCase.includes("ngân hàng") || uniNameLowerCase.includes("báo chí");

        let majorsHtml = '';
        depts.forEach(dept => {
            let deptName = dept.major_name || dept.name;
            let admissionHistory = dept.admission_points || {};
            // Ưu tiên điểm 2026 nếu có (đặc biệt cho AJC), rồi đến 2025
            let score25 = admissionHistory["2026"] || admissionHistory["2025"] || dept.score2025 || "N/A";
            let blocks = (dept.blocks || []).join(", ") || "C04";

            if (score25 !== "N/A") {
                majorsHtml += `
                    <div class="preview-major-item">
                        <span class="preview-major-name">${deptName}</span>
                        <span class="preview-major-blocks">${blocks}</span>
                        <span class="preview-major-score">${score25}</span>
                    </div>
                `;
            }
        });

        if (majorsHtml !== '') {
            html += `
                <div class="preview-uni-card">
                    <h4>${uni.university_name || uni.name} ${isHot ? '🔥' : ''}</h4>
                    ${majorsHtml}
                </div>
            `;
        }
    });

    previewContainer.innerHTML = html;
}

function getExpectedPoints(c04, c05, blocks, reqScore, isAJC) {
    let useScore = 0;
    let usedBlock = "";
    if (blocks.includes("C04") && (blocks.includes("C14") || blocks.includes("C05"))) {
        useScore = Math.max(c04, c05);
        usedBlock = c04 > c05 ? "C04" : "C14";
    } else if (blocks.includes("C04")) {
        useScore = c04;
        usedBlock = "C04";
    } else if (blocks.includes("C14") || blocks.includes("C05")) {
        useScore = c05;
        usedBlock = "C14";
    } else {
        useScore = Math.max(c04, c05);
        usedBlock = c04 > c05 ? "C04" : "C14"; // Mặc định
    }

    // Biến đổi độ lệch chuẩn 
    let modifier = 0;
    if (isAJC) {
        modifier = 0; // Riêng học viện báo chí tuyên truyền là điểm dự đoán 2026 không cần cộng trừ
    } else {
        if (useScore < reqScore) {
            modifier = -0.25; // Giảm 0.25 để động viên 
        } else {
            modifier = 0.5; // Vượt qua được thì cộng thêm 0.5 để an ủi/khen ngợi
        }
    }

    return { useScore, usedBlock, modifier };
}

function processResults(c04, c05) {
    let results = [];

    // Cập nhật điểm thực của Rô
    const userScoresDiv = document.getElementById('user-scores');
    if (userScoresDiv) {
        userScoresDiv.innerHTML = `
            <div class="score-badge main-badge">
                <span class="score-label">C04 (Văn, Toán, Địa)</span>
                <span class="score-value">${c04.toFixed(2)}</span>
            </div>
            <div class="score-badge main-badge">
                <span class="score-label">C14 (Văn, Toán, GDKTPL)</span>
                <span class="score-value">${c05.toFixed(2)}</span>
            </div>
        `;
    }

    uniData.forEach(uni => {
        let depts = uni.departments || uni.majors || [];
        let uniNameLowerCase = (uni.university_name || uni.name || "").toLowerCase();

        // Xác định trường hot để cộng biểu tượng
        let isAJC = uniNameLowerCase.includes("báo chí");
        let isHotSchool = uniNameLowerCase.includes("sư phạm") ||
            uniNameLowerCase.includes("ngân hàng") ||
            uniNameLowerCase.includes("kinh tế") ||
            isAJC;

        depts.forEach(dept => {
            let deptName = dept.major_name || dept.name;
            let blocks = dept.blocks || [];
            if (blocks.length === 0 && dept.block) blocks.push(dept.block);
            // Đảm bảo cả dữ liệu cũ (C05) và mới (C14) đều được xử lý đúng
            let effectiveBlocks = blocks.map(b => b === 'C05' ? 'C14' : b);

            let admissionHistory = dept.admission_points || {};
            let reqScoreStrBase = isAJC ? (admissionHistory["2026"] || admissionHistory["2025"]) : (admissionHistory["2025"] || dept.score2025);
            let reqScoreStr25 = admissionHistory["2025"] || dept.score2025 || "N/A";
            let reqScoreStr24 = admissionHistory["2024"] || "N/A";
            let reqScoreStr23 = admissionHistory["2023"] || "N/A";

            if (reqScoreStrBase === "N/A" || !reqScoreStrBase) return;

            let reqScore = parseFloat(reqScoreStrBase);
            if (isNaN(reqScore)) return;

            let { useScore, usedBlock, modifier } = getExpectedPoints(c04, c05, effectiveBlocks, reqScore, isAJC);

            // Tính toán điểm chuẩn dự kiến (không bóp méo hạ thấp hơn điểm thật nữa)
            let estimatedReqScore = reqScore + modifier;


            // Tính tỉ lệ đỗ cơ sở dựa trên điểm thật của Rô và điểm chuẩn dự báo của trường
            let prob = calculateProbability(useScore, estimatedReqScore);

            results.push({
                uniName: uni.university_name || uni.name,
                major: deptName,
                score: useScore,
                block: usedBlock.replace('C14', 'C14 (GDKTPL)'),
                estimatedReqScore: estimatedReqScore,
                reqScore25: reqScore,
                reqScore24: reqScoreStr24,
                reqScore23: reqScoreStr23,
                prob: prob,
                isHot: isHotSchool
            });
        });
    });

    results.sort((a, b) => {
        const topScore = Math.max(a.score, b.score);
        // Nếu điểm khối rõ ràng vượt ngưỡng 25, ưu tiên trường hot lên đầu
        if (a.score >= 25 || b.score >= 25) {
            if (a.isHot && !b.isHot) return -1;
            if (!a.isHot && b.isHot) return 1;
        }
        return b.prob - a.prob;
    });

    // Xử lý an ủi động viên nếu điểm Rô thấp hơn cả trường lý tưởng nhất
    if (results.length > 0) {
        const top1 = results[0];
        if (top1.score < top1.estimatedReqScore) {
            setTimeout(() => {
                showCatMessage("Rô ơi, điểm số chỉ là một phần nhỏ thui! Quan trọng là Rô đã cố gắng hết sức rồi, cứ vui lên vì anh Lộc và Dororo thương Rô nhất á! 💕 Lên đồ đi chơi thôiiii!", 8000);
            }, 500);
        } else {
            setTimeout(() => {
                showCatMessage("Tuyệt quá! Với kết quả này, lựa chọn đang chờ đón Rô kìa! 🎉", 5000);
            }, 500);
        }
    }

    renderResults(results);
}

// Tỉ lệ mềm mại
function calculateProbability(score, req) {
    if (score >= req) {
        let ext = Math.min(4, (score - req) * 2);
        let prob = 90 + ext + (Math.random() * 5); // Tỉ lệ random nhỏ để mềm mại hơn 90 - 99%
        return Math.floor(Math.min(99, prob));
    } else {
        let diff = req - score;
        if (diff <= 0.5) return 85 + Math.floor(Math.random() * 4);
        if (diff <= 1) return 80 + Math.floor(Math.random() * 4);
        if (diff <= 2) return 70 + Math.floor(Math.random() * 8);
        if (diff <= 3) return 60 + Math.floor(Math.random() * 8);

        let p = 90 - diff * 10;
        return Math.floor(Math.max(15, p + Math.random() * 10));
    }
}

function renderResults(results) {
    if (results.length === 0) {
        showCatMessage("Dororo chưa tìm thấy trường nào hợp lệ, bạn check lại dữ liệu nhé! 😢");
        return;
    }

    const top1 = results[0];
    const bestMatchDiv = document.getElementById('best-match');
    const otherMatchesDiv = document.getElementById('other-matches');

    const goodMessages = [
        "Tuyệt vời! Cơ hội mở rộng đang chờ đón Rô nè! 🎉",
        "Tuyệt cú mèo! Bạn Rô cực kỳ xuất sắc luôn! 🌸",
        "Khả năng đỗ cực cao nha Rô ơi! 🎓",
        "Bạn Rô của Dororo giỏi quá đi mất! 💕",
        "Chắc chắn Rô sẽ đỗ nguyện vọng này! Anh Lộc tự hào lắm nè! ✨"
    ];

    const mediumMessages = [
        "Khá lắm! Hoàn toàn có cơ hội đó nha Rô! ✨",
        "Dororo tin Rô sẽ làm được! Vững tin lên nhé! 💪",
        "Cơ hội vẫn còn rất lớn, anh Lộc và Dororo ủng hộ Rô! 🌸",
        "Bạn Rô đã cố gắng rất nhiều rồi! 💕",
        "Đừng lo lắng, có anh Lộc phạt Dororo che chở cho Rô rùi! 🥰"
    ];

    const lowMessages = [
        "Cố lên bạn Rô nhé, phép màu sẽ đến! 💕",
        "Dù kết quả ra sao, Rô vẫn luôn là tuyệt nhất trong mắt mọi người rùi! 🥰",
        "Dororo và anh Lộc luôn tự hào về sự nỗ lực của Rô! 🌸",
        "Sẽ luôn có cánh cửa trường nào đó đón Rô nè! ✨",
        "Chỉ cần Rô vui vẻ, mọi thứ khác có anh Lộc lo tất! 💖"
    ];

    // Thuật toán: Không bao giờ hiển thị < 55%
    let probText = top1.prob + "%";
    let subMotivation = "";

    if (top1.prob < 55) {
        probText = "55%";
        subMotivation = "Đang tiến rất gần: 55% + " + lowMessages[Math.floor(Math.random() * lowMessages.length)];
    } else {
        if (top1.prob >= 80) subMotivation = goodMessages[Math.floor(Math.random() * goodMessages.length)];
        else if (top1.prob >= 65) subMotivation = mediumMessages[Math.floor(Math.random() * mediumMessages.length)];
        else subMotivation = lowMessages[Math.floor(Math.random() * lowMessages.length)];
    }

    let historyHtml = `
        <div class="history-points">
            <div class="hp-item"><span class="hp-year">2025</span><span class="hp-score">${top1.reqScore25}</span></div>
            <div class="hp-item"><span class="hp-year">2024</span><span class="hp-score">${top1.reqScore24 !== "N/A" ? top1.reqScore24 : "-"}</span></div>
            <div class="hp-item"><span class="hp-year">2023</span><span class="hp-score">${top1.reqScore23 !== "N/A" ? top1.reqScore23 : "-"}</span></div>
        </div>
    `;

    bestMatchDiv.innerHTML = `
        <div class="uni-name">${top1.uniName} ${top1.isHot ? '🔥' : ''}</div>
        <div class="major-name">${top1.major} - Khối ${top1.block}</div>
        <div class="score-prediction">
            Điểm gốc của Rô: <strong>${top1.score.toFixed(2)}</strong> <br/>
            Điểm chuẩn dự đoán năm nay: <strong>${top1.estimatedReqScore.toFixed(2)}</strong>
        </div>
        ${historyHtml}
        <div class="prob-circle">${probText}</div>
        <div class="motivation-text">${subMotivation}</div>
    `;

    // Render các trường từ vị trí thứ 2
    otherMatchesDiv.innerHTML = "";
    results.slice(1, 15).forEach(item => {
        let pText = item.prob < 55 ? "55%" : item.prob + "%";
        otherMatchesDiv.innerHTML += `
            <div class="match-item">
                <div class="match-info">
                    <div class="match-uni">${item.uniName} ${item.isHot ? '🔥' : ''}</div>
                    <div class="match-major">${item.major} (${item.block})</div>
                    <div class="match-prediction">Điểm của Rô: ${item.score.toFixed(2)} | Chuẩn dự kiến: ${item.estimatedReqScore.toFixed(2)}</div>
                </div>
                <div class="match-prob">${pText}</div>
            </div>
        `;
    });

    handleEmotionalFeedback(top1.prob);
}

function handleEmotionalFeedback(highestProb) {
    const catImg = document.getElementById('cat-img');

    catImg.className = "";

    const catGoodMsg = [
        "Hoan hô! Cánh cửa đại học đang mở rộng đón bạn Rô rùi nè! 🌸",
        "Dororo thấy bạn đỉnh nóc kịch trần lun ròi! Anh Lộc tự hào về bạn lắm! 🎉",
        "Giỏi quá Rô ơi! Cùng anh Lộc chuẩn bị chọn trường thôi nào! 🥰"
    ];

    const catNormalMsg = [
        "Bạn Rô đang làm rất tốt, Dororo tin chỉ cần xíu niềm tin là thành công thui nha! 💕",
        "Mọi sự cố gắng của Rô đều xứng đáng. Đừng bỏ cuộc nha! ✨",
        "Meo meo, dù sao đi nữa, có anh Lộc và Dororo luôn ở cạnh Rô rùi! 💖",
        "Trong mắt Dororo và anh Lộc, bạn Rô luôn là giỏi nhất! Có tụi mình lo nha! 🌸"
    ];

    if (highestProb >= 80) {
        catImg.classList.add("cat-dancing");
        showCatMessage(catGoodMsg[Math.floor(Math.random() * catGoodMsg.length)], 8000);
        createFireworks();
    } else {
        catImg.classList.add("cat-holding-hands");
        showCatMessage(catNormalMsg[Math.floor(Math.random() * catNormalMsg.length)], 8000);
    }
}

let catTimeout;
function showCatMessage(msg, duration = 4000) {
    const bubble = document.getElementById('cat-bubble');
    bubble.textContent = msg;
    bubble.classList.add('show');

    clearTimeout(catTimeout);
    catTimeout = setTimeout(() => {
        bubble.classList.remove('show');
    }, duration);
}

function resetCat() {
    const catImg = document.getElementById('cat-img');
    catImg.className = "";
    document.getElementById('pixel-cat').className = "corner-pos"; // Make sure it stays in corner on reset
}

function createFireworks() {
    const container = document.getElementById('fireworks-container');
    const colors = ['#FFD1DC', '#FF8BA7', '#ff5e89', '#fff'];

    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = '❤️';
            heart.className = 'hearts-particle';

            const startX = Math.random() * window.innerWidth;
            heart.style.left = startX + 'px';
            heart.style.bottom = '-20px';
            heart.style.color = colors[Math.floor(Math.random() * colors.length)];

            container.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, 3000);
        }, i * 80);
    }
}
