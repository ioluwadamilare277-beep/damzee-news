document.addEventListener("DOMContentLoaded", () => {

    const articleForm =
        document.getElementById("articleForm");

    const articlesList =
        document.getElementById("articlesList");

    const totalArticles =
        document.getElementById("totalArticles");

    const totalViews =
        document.getElementById("totalViews");

    const publishedArticles =
        document.getElementById("publishedArticles");

    const viewsChart =
        document.getElementById("viewsChart");

    const categoryChart =
        document.getElementById("categoryChart");

    const activityList =
        document.getElementById("activityList");

    const notificationButton =
        document.getElementById("notificationButton");

    const notificationPanel =
        document.getElementById("notificationPanel");

    const notificationList =
        document.getElementById("notificationList");

    const notificationBadge =
        document.getElementById("notificationBadge");

    const notificationCount =
        document.getElementById("notificationCount");

    const markNotificationsRead =
        document.getElementById("markNotificationsRead");

    const systemStatus =
        document.getElementById("systemStatus");

    const lastActive =
        document.getElementById("lastActive");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const adminSidebar =
        document.getElementById("adminSidebar");

    const clearForm =
        document.getElementById("clearForm");

    const articleSearch =
        document.getElementById("articleSearch");

    const articleFilter =
        document.getElementById("articleFilter");

    const articleStatusFilter =
        document.getElementById("articleStatusFilter");

    const articleStatus =
        document.getElementById("articleStatus");

    const articleBreaking =
        document.getElementById("articleBreaking");

    const subscriberCount =
        document.getElementById("subscriberCount");

    const subscriberList =
        document.getElementById("subscriberList");


    /* =========================================
       IMAGE UPLOAD ELEMENTS
    ========================================= */

    const articleImageFile =
        document.getElementById("articleImageFile");

    const imagePreview =
        document.getElementById("imagePreview");

    const imagePreviewContainer =
        document.getElementById("imagePreviewContainer");

    const removeImage =
        document.getElementById("removeImage");

    const imageUploadStatus =
        document.getElementById("imageUploadStatus");


    let editingArticleId = null;
    let articlesCache = [];

    let subscriberPage = 1;
    const subscribersPerPage = 20;
    let subscriberSearchTerm = "";

    let existingArticleImage = "";

    let previewObjectUrl = null;


    /* =========================================
       SUPABASE CHECK
    ========================================= */

    if (
        !window.supabase ||
        typeof supabaseClient === "undefined"
    ) {

        console.error(
            "DΛMZΞΞ NEWS: Supabase client is not available."
        );

        if (systemStatus) {
            systemStatus.textContent = "Offline";
        }

        return;
    }


    /* =========================================
       STORAGE SETTINGS
    ========================================= */

    const IMAGE_BUCKET =
        "article-images";

    const MAX_IMAGE_SIZE =
        5 * 1024 * 1024;


    /* =========================================
       FALLBACK IMAGE
    ========================================= */

    const fallbackImage =
        "https://placehold.co/800x500/edf1f5/788396?text=DAMZEE+NEWS";


    /* =========================================
       CLEAN IMAGE URL
    ========================================= */

    function getImageUrl(image) {

        if (!image) {
            return fallbackImage;
        }

        let url =
            String(image).trim();

        if (!url) {
            return fallbackImage;
        }

        url =
            url
                .replace(/^["']|["']$/g, "")
                .trim();


        if (
            url.startsWith("https://") ||
            url.startsWith("http://")
        ) {
            return url;
        }


        if (url.startsWith("//")) {
            return "https:" + url;
        }


        if (url.startsWith("/")) {
            return window.location.origin + url;
        }


        return fallbackImage;
    }


    /* =========================================
       ARTICLE PAGE URL
    ========================================= */

    function getArticleUrl(articleId) {

        return new URL(
            "../article.html?id=" +
            encodeURIComponent(articleId),
            window.location.href
        ).href;
    }


    /* =========================================
       COPY ARTICLE LINK
    ========================================= */

    async function copyArticleLink(
        articleId,
        button
    ) {

        const articleUrl =
            getArticleUrl(articleId);

        const originalText =
            button.textContent;


        try {

            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {

                await navigator.clipboard.writeText(
                    articleUrl
                );

            }

            else {

                const temporaryInput =
                    document.createElement("input");

                temporaryInput.value =
                    articleUrl;

                temporaryInput.style.position =
                    "fixed";

                temporaryInput.style.left =
                    "-9999px";

                temporaryInput.style.top =
                    "0";

                document.body.appendChild(
                    temporaryInput
                );

                temporaryInput.focus();

                temporaryInput.select();

                document.execCommand(
                    "copy"
                );

                temporaryInput.remove();
            }


            button.textContent =
                "Copied!";


            setTimeout(() => {

                button.textContent =
                    originalText;

            }, 1800);


        }

        catch (error) {

            console.error(
                "DΛMZΞΞ NEWS: Unable to copy article link.",
                error
            );


            alert(
                "Unable to copy the article link.\n\n" +
                articleUrl
            );
        }
    }


    /* =========================================
       IMAGE PREVIEW
       NO PERMANENT WATERMARK
    ========================================= */

    function clearImageSelection() {

        if (previewObjectUrl) {

            URL.revokeObjectURL(
                previewObjectUrl
            );

            previewObjectUrl =
                null;
        }


        if (articleImageFile) {
            articleImageFile.value = "";
        }


        if (imagePreview) {
            imagePreview.src = "";
        }


        if (imagePreviewContainer) {

            imagePreviewContainer.style.display =
                "none";
        }


        if (imageUploadStatus) {

            imageUploadStatus.textContent =
                existingArticleImage
                    ? "Current article image will be kept unless you choose a new image."
                    : "Select an image to upload.";
        }
    }


    async function showImagePreview(file) {

        if (!file) {
            return false;
        }


        if (
            ![
                "image/jpeg",
                "image/png",
                "image/webp"
            ].includes(file.type)
        ) {

            alert(
                "Please choose a JPG, PNG or WebP image."
            );

            clearImageSelection();

            return false;
        }


        if (file.size > MAX_IMAGE_SIZE) {

            alert(
                "Image is too large.\n\n" +
                "Maximum allowed size is 5 MB."
            );

            clearImageSelection();

            return false;
        }


        if (previewObjectUrl) {

            URL.revokeObjectURL(
                previewObjectUrl
            );
        }


        previewObjectUrl =
            URL.createObjectURL(
                file
            );


        if (imagePreview) {

            imagePreview.src =
                previewObjectUrl;
        }


        if (imagePreviewContainer) {

            imagePreviewContainer.style.display =
                "block";
        }


        if (imageUploadStatus) {

            imageUploadStatus.textContent =
                "Image ready to upload: " +
                file.name;
        }


        return true;
    }


    /* =========================================
       IMAGE FILE SELECTED
    ========================================= */

    if (articleImageFile) {

        articleImageFile.addEventListener(
            "change",
            async () => {

                const file =
                    articleImageFile.files &&
                    articleImageFile.files[0];

                if (!file) {
                    return;
                }

                await showImagePreview(
                    file
                );
            }
        );
    }


    /* =========================================
       REMOVE IMAGE
    ========================================= */

    if (removeImage) {

        removeImage.addEventListener(
            "click",
            () => {

                existingArticleImage = "";

                clearImageSelection();

                if (imageUploadStatus) {

                    imageUploadStatus.textContent =
                        "Image removed. Select a new image or save without one.";
                }
            }
        );
    }


    /* =========================================
       UPLOAD IMAGE TO SUPABASE STORAGE
       ORIGINAL IMAGE — NO WATERMARK
    ========================================= */

    async function uploadArticleImage(file) {

        if (!file) {
            return null;
        }


        if (
            ![
                "image/jpeg",
                "image/png",
                "image/webp"
            ].includes(file.type)
        ) {

            throw new Error(
                "Only JPG, PNG and WebP images are allowed."
            );
        }


        if (file.size > MAX_IMAGE_SIZE) {

            throw new Error(
                "Image is too large. Maximum allowed size is 5 MB."
            );
        }


        if (imageUploadStatus) {

            imageUploadStatus.textContent =
                "Uploading image...";
        }


        const extensionMap = {

            "image/jpeg":
                "jpg",

            "image/png":
                "png",

            "image/webp":
                "webp"
        };


        const extension =
            extensionMap[file.type] ||
            "jpg";


        const uniqueName =
            "article-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 10) +
            "." +
            extension;


        const filePath =
            "articles/" +
            uniqueName;


        const {
            error: uploadError
        } = await supabaseClient
            .storage
            .from(IMAGE_BUCKET)
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type
                }
            );


        if (uploadError) {

            console.error(
                "DΛMZΞΞ NEWS: Image upload failed.",
                uploadError
            );

            throw new Error(
                "Image upload failed: " +
                uploadError.message
            );
        }


        const {
            data
        } =
            supabaseClient
                .storage
                .from(IMAGE_BUCKET)
                .getPublicUrl(
                    filePath
                );


        if (
            !data ||
            !data.publicUrl
        ) {

            throw new Error(
                "Image uploaded, but the public image URL could not be created."
            );
        }


        if (imageUploadStatus) {

            imageUploadStatus.textContent =
                "Image uploaded successfully.";
        }


        return data.publicUrl;
    }


    /* =========================================
       GET ARTICLES
    ========================================= */

    async function getArticles() {

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("articles")
                .select("*")
                .order("id", {
                    ascending: false
                });


            if (error) {

                console.error(
                    "DΛMZΞΞ NEWS: Unable to load articles.",
                    error
                );

                return [];
            }


            articlesCache =
                Array.isArray(data)
                    ? data
                    : [];


            return articlesCache;

        }

        catch (error) {

            console.error(
                "DΛMZΞΞ NEWS: Database error.",
                error
            );

            return [];
        }
    }


    /* =========================================
       ACTIVITY
    ========================================= */

    function getActivity() {

        const saved =
            localStorage.getItem(
                "damzeeActivity"
            );

        if (!saved) {
            return [];
        }

        try {

            const activity =
                JSON.parse(saved);

            return Array.isArray(activity)
                ? activity
                : [];

        }

        catch (error) {

            console.error(
                "DΛMZΞΞ NEWS: Unable to load activity.",
                error
            );

            return [];
        }
    }


    function saveActivity(activity) {

        localStorage.setItem(
            "damzeeActivity",
            JSON.stringify(activity)
        );
    }


    function addActivity(
        type,
        title,
        articleId
    ) {

        const activity =
            getActivity();

        const now =
            new Date();

        activity.unshift({

            id: Date.now(),

            type: type,

            title:
                title ||
                "Untitled Article",

            articleId: articleId,

            date:
                now.toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                ),

            time:
                now.toLocaleTimeString(
                    "en-GB",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
        });


        saveActivity(
            activity.slice(0, 15)
        );

        updateActivityList();
    }


    function updateActivityList() {

        if (!activityList) {
            return;
        }

        const activity =
            getActivity();

        activityList.innerHTML = "";


        if (activity.length === 0) {

            const empty =
                document.createElement("div");

            empty.className =
                "activity-empty";

            empty.textContent =
                "No recent activity yet.";

            activityList.appendChild(
                empty
            );

            return;
        }


        activity.forEach(item => {

            const row =
                document.createElement("div");

            row.className =
                "activity-item";


            const icon =
                document.createElement("div");

            icon.className =
                "activity-icon";


            if (item.type === "published") {

                icon.textContent = "+";

                icon.classList.add(
                    "activity-published"
                );

            }

            else if (item.type === "draft") {

                icon.textContent = "●";

                icon.classList.add(
                    "activity-updated"
                );

            }

            else if (item.type === "updated") {

                icon.textContent = "✎";

                icon.classList.add(
                    "activity-updated"
                );

            }

            else if (item.type === "deleted") {

                icon.textContent = "×";

                icon.classList.add(
                    "activity-deleted"
                );

            }

            else {

                icon.textContent = "•";
            }


            const information =
                document.createElement("div");

            information.className =
                "activity-information";


            const message =
                document.createElement("p");


            if (item.type === "published") {

                message.innerHTML =
                    "<strong>Article published</strong>";

            }

            else if (item.type === "draft") {

                message.innerHTML =
                    "<strong>Moved to draft</strong>";

            }

            else if (item.type === "updated") {

                message.innerHTML =
                    "<strong>Article updated</strong>";

            }

            else if (item.type === "deleted") {

                message.innerHTML =
                    "<strong>Article deleted</strong>";

            }

            else {

                message.innerHTML =
                    "<strong>Article activity</strong>";
            }


            const title =
                document.createElement("span");

            title.textContent =
                item.title;


            const meta =
                document.createElement("small");

            meta.textContent =
                item.date +
                " · " +
                item.time;


            information.appendChild(message);
            information.appendChild(title);
            information.appendChild(meta);

            row.appendChild(icon);
            row.appendChild(information);

            activityList.appendChild(row);
        });
    }


    /* =========================================
       NOTIFICATIONS
    ========================================= */

    function getNotifications() {

        const saved =
            localStorage.getItem(
                "damzeeNotifications"
            );

        if (!saved) {
            return [];
        }

        try {

            const notifications =
                JSON.parse(saved);

            return Array.isArray(notifications)
                ? notifications
                : [];

        }

        catch (error) {

            console.error(
                "DΛMZΞΞ NEWS: Unable to load notifications.",
                error
            );

            return [];
        }
    }


    function saveNotifications(
        notifications
    ) {

        localStorage.setItem(
            "damzeeNotifications",
            JSON.stringify(
                notifications
            )
        );
    }


    function addNotification(
        type,
        title
    ) {

        const notifications =
            getNotifications();

        const now =
            new Date();

        notifications.unshift({

            id: Date.now(),

            type: type,

            title:
                title ||
                "Untitled Article",

            read: false,

            date:
                now.toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                ),

            time:
                now.toLocaleTimeString(
                    "en-GB",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
        });


        saveNotifications(
            notifications.slice(0, 20)
        );

        updateNotifications();
    }


    function updateNotifications() {

        if (!notificationList) {
            return;
        }

        const notifications =
            getNotifications();

        notificationList.innerHTML = "";


        const unreadCount =
            notifications.filter(
                notification =>
                    !notification.read
            ).length;


        if (notificationBadge) {

            if (unreadCount > 0) {

                notificationBadge.textContent =
                    unreadCount > 99
                        ? "99+"
                        : unreadCount;

                notificationBadge.classList.remove(
                    "hidden"
                );

            }

            else {

                notificationBadge.textContent =
                    "0";

                notificationBadge.classList.add(
                    "hidden"
                );
            }
        }


        if (notificationCount) {

            notificationCount.textContent =
                unreadCount === 0
                    ? "No new notifications"
                    : unreadCount === 1
                        ? "1 unread notification"
                        : unreadCount +
                          " unread notifications";
        }


        if (notifications.length === 0) {

            const empty =
                document.createElement("div");

            empty.className =
                "notification-empty";


            const icon =
                document.createElement("div");

            icon.className =
                "notification-empty-icon";

            icon.textContent =
                "🔔";


            const text =
                document.createElement("div");

            text.textContent =
                "No notifications yet.";


            empty.appendChild(icon);
            empty.appendChild(text);

            notificationList.appendChild(empty);

            return;
        }


        notifications
            .slice(0, 10)
            .forEach(notification => {

                const item =
                    document.createElement("div");

                item.className =
                    "notification-item";


                if (!notification.read) {

                    item.classList.add(
                        "unread"
                    );
                }


                if (notification.type) {

                    item.classList.add(
                        notification.type
                    );
                }


                const icon =
                    document.createElement("div");

                icon.className =
                    "notification-item-icon";


                if (
                    notification.type ===
                    "published"
                ) {

                    icon.textContent = "+";

                }

                else if (
                    notification.type ===
                    "draft"
                ) {

                    icon.textContent = "●";

                }

                else if (
                    notification.type ===
                    "updated"
                ) {

                    icon.textContent = "✎";

                }

                else if (
                    notification.type ===
                    "deleted"
                ) {

                    icon.textContent = "×";

                }

                else {

                    icon.textContent = "•";
                }


                const content =
                    document.createElement("div");

                content.className =
                    "notification-item-content";


                const message =
                    document.createElement("strong");


                if (
                    notification.type ===
                    "published"
                ) {

                    message.textContent =
                        "Article published";

                }

                else if (
                    notification.type ===
                    "draft"
                ) {

                    message.textContent =
                        "Article moved to draft";

                }

                else if (
                    notification.type ===
                    "updated"
                ) {

                    message.textContent =
                        "Article updated";

                }

                else if (
                    notification.type ===
                    "deleted"
                ) {

                    message.textContent =
                        "Article deleted";

                }

                else {

                    message.textContent =
                        "Admin activity";
                }


                const title =
                    document.createElement("p");

                title.textContent =
                    notification.title;


                const time =
                    document.createElement("small");

                time.textContent =
                    notification.date +
                    " · " +
                    notification.time;


                content.appendChild(message);
                content.appendChild(title);
                content.appendChild(time);

                item.appendChild(icon);
                item.appendChild(content);

                notificationList.appendChild(item);
            });
    }


    /* =========================================
       NOTIFICATION BELL
    ========================================= */

    if (
        notificationButton &&
        notificationPanel
    ) {

        notificationButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                notificationPanel.classList.toggle(
                    "open"
                );
            }
        );


        notificationPanel.addEventListener(
            "click",
            event => {

                event.stopPropagation();
            }
        );


        document.addEventListener(
            "click",
            () => {

                notificationPanel.classList.remove(
                    "open"
                );
            }
        );
    }


    /* =========================================
       MARK NOTIFICATIONS READ
    ========================================= */

    if (markNotificationsRead) {

        markNotificationsRead.addEventListener(
            "click",
            () => {

                const notifications =
                    getNotifications();


                notifications.forEach(
                    notification => {

                        notification.read =
                            true;
                    }
                );


                saveNotifications(
                    notifications
                );

                updateNotifications();
            }
        );
    }


    /* =========================================
       MOBILE MENU
    ========================================= */

    if (
        mobileMenu &&
        adminSidebar
    ) {

        mobileMenu.addEventListener(
            "click",
            () => {

                adminSidebar.classList.toggle(
                    "open"
                );
            }
        );


        const sidebarLinks =
            adminSidebar.querySelectorAll(
                "nav a"
            );


        sidebarLinks.forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    adminSidebar.classList.remove(
                        "open"
                    );
                }
            );
        });
    }


    /* =========================================
       SYSTEM STATUS
    ========================================= */

    function updateSystemStatus() {

        const now =
            new Date();


        if (systemStatus) {

            systemStatus.textContent =
                "Online";
        }


        if (lastActive) {

            lastActive.textContent =
                "Last active: " +
                now.toLocaleTimeString(
                    "en-GB",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );
        }
    }


    /* =========================================
       TOTAL VIEWS
    ========================================= */

    function updateTotalViews() {

        const views =
            articlesCache.reduce(
                (total, article) => {

                    return total +
                        (
                            Number(
                                article.views
                            ) ||
                            0
                        );
                },
                0
            );


        if (totalViews) {

            totalViews.textContent =
                views.toLocaleString();
        }
    }


    /* =========================================
       VIEWS CHART
    ========================================= */

    function updateViewsChart() {

        if (!viewsChart) {
            return;
        }


        const articles =
            articlesCache;


        viewsChart.innerHTML = "";


        if (articles.length === 0) {

            const message =
                document.createElement("div");

            message.style.width =
                "100%";

            message.style.textAlign =
                "center";

            message.style.color =
                "#788396";

            message.style.padding =
                "80px 20px";

            message.style.fontSize =
                "13px";

            message.textContent =
                "No article views available yet.";

            viewsChart.appendChild(
                message
            );

            return;
        }


        const highestViews =
            Math.max(
                ...articles.map(
                    article =>
                        Number(
                            article.views
                        ) ||
                        0
                ),
                1
            );


        articles
            .slice()
            .reverse()
            .forEach(article => {

                const views =
                    Number(
                        article.views
                    ) ||
                    0;


                const barHeight =
                    Math.max(
                        (
                            views /
                            highestViews
                        ) * 100,
                        5
                    );


                const wrapper =
                    document.createElement("div");

                wrapper.style.minWidth =
                    "90px";

                wrapper.style.flex =
                    "1";

                wrapper.style.height =
                    "250px";

                wrapper.style.display =
                    "flex";

                wrapper.style.flexDirection =
                    "column";

                wrapper.style.justifyContent =
                    "flex-end";

                wrapper.style.alignItems =
                    "center";

                wrapper.style.gap =
                    "8px";


                const viewCount =
                    document.createElement("strong");

                viewCount.textContent =
                    views.toLocaleString();

                viewCount.style.fontSize =
                    "11px";

                viewCount.style.color =
                    "#172033";


                const bar =
                    document.createElement("div");

                bar.style.width =
                    "55px";

                bar.style.height =
                    barHeight + "%";

                bar.style.minHeight =
                    "10px";

                bar.style.background =
                    "#075fc7";

                bar.style.borderRadius =
                    "5px 5px 0 0";

                bar.style.transition =
                    "height 0.4s ease";


                const label =
                    document.createElement("span");


                const title =
                    article.title ||
                    "Article";


                label.textContent =
                    title.length > 14
                        ? title.substring(
                            0,
                            14
                        ) + "..."
                        : title;


                label.title =
                    title;

                label.style.width =
                    "90px";

                label.style.textAlign =
                    "center";

                label.style.fontSize =
                    "10px";

                label.style.color =
                    "#788396";

                label.style.lineHeight =
                    "1.3";


                wrapper.appendChild(
                    viewCount
                );

                wrapper.appendChild(
                    bar
                );

                wrapper.appendChild(
                    label
                );

                viewsChart.appendChild(
                    wrapper
                );
            });
    }


    /* =========================================
       CATEGORY CHART
    ========================================= */

    function updateCategoryChart() {

        if (!categoryChart) {
            return;
        }


        categoryChart.innerHTML = "";


        const categories = [
            "World",
            "Politics",
            "Business",
            "Technology",
            "Sports",
            "Entertainment",
            "Lifestyle"
        ];


        if (articlesCache.length === 0) {

            const message =
                document.createElement("div");

            message.style.width =
                "100%";

            message.style.textAlign =
                "center";

            message.style.padding =
                "60px 20px";

            message.style.color =
                "#788396";

            message.style.fontSize =
                "13px";

            message.textContent =
                "No category data available yet.";

            categoryChart.appendChild(
                message
            );

            return;
        }


        const categoryCounts = {};


        categories.forEach(
            category => {

                categoryCounts[category] =
                    0;
            }
        );


        articlesCache.forEach(article => {

            const category =
                article.category;


            if (
                category &&
                Object.prototype.hasOwnProperty.call(
                    categoryCounts,
                    category
                )
            ) {

                categoryCounts[category]++;
            }
        });


        const highestCount =
            Math.max(
                ...Object.values(
                    categoryCounts
                ),
                1
            );


        categories.forEach(category => {

            const count =
                categoryCounts[category];


            const percentage =
                (
                    count /
                    highestCount
                ) * 100;


            const item =
                document.createElement("div");

            item.style.marginBottom =
                "20px";


            const topRow =
                document.createElement("div");

            topRow.style.display =
                "flex";

            topRow.style.alignItems =
                "center";

            topRow.style.justifyContent =
                "space-between";

            topRow.style.marginBottom =
                "7px";


            const name =
                document.createElement("strong");

            name.textContent =
                category;

            name.style.fontSize =
                "13px";

            name.style.color =
                "#303b4d";


            const countText =
                document.createElement("span");

            countText.textContent =
                count +
                (
                    count === 1
                        ? " article"
                        : " articles"
                );

            countText.style.fontSize =
                "12px";

            countText.style.color =
                "#788396";


            topRow.appendChild(name);
            topRow.appendChild(countText);


            const track =
                document.createElement("div");

            track.style.width =
                "100%";

            track.style.height =
                "10px";

            track.style.background =
                "#edf1f5";

            track.style.borderRadius =
                "20px";

            track.style.overflow =
                "hidden";


            const bar =
                document.createElement("div");

            bar.style.width =
                count === 0
                    ? "0%"
                    : Math.max(
                        percentage,
                        4
                    ) + "%";

            bar.style.height =
                "100%";

            bar.style.background =
                "#075fc7";

            bar.style.borderRadius =
                "20px";

            bar.style.transition =
                "width 0.4s ease";


            track.appendChild(bar);

            item.appendChild(topRow);
            item.appendChild(track);

            categoryChart.appendChild(item);
        });
    }


    /* =========================================
       RESET ARTICLE FORM
    ========================================= */

    function resetArticleForm() {

        editingArticleId =
            null;

        existingArticleImage =
            "";


        if (articleForm) {

            articleForm.reset();
        }


        const authorInput =
            document.getElementById(
                "articleAuthor"
            );


        if (authorInput) {

            authorInput.value =
                "DΛMZΞΞ NEWS";
        }


        if (articleStatus) {

            articleStatus.value =
                "published";
        }


        if (articleBreaking) {

            articleBreaking.value =
                "no";
        }


        clearImageSelection();


        const submitButton =
            articleForm
                ? articleForm.querySelector(
                    'button[type="submit"]'
                )
                : null;


        if (submitButton) {

            submitButton.textContent =
                "Save Article";
        }


        const panelHeading =
            document.querySelector(
                "#new-article .panel-header h2"
            );


        if (panelHeading) {

            panelHeading.textContent =
                "Create New Article";
        }
    }


    /* =========================================
       CHANGE ARTICLE STATUS
    ========================================= */

    async function changeArticleStatus(article) {

        const currentStatus =
            article.status === "draft"
                ? "draft"
                : "published";


        const newStatus =
            currentStatus === "draft"
                ? "published"
                : "draft";


        const actionText =
            newStatus === "published"
                ? "publish"
                : "move this article to draft";


        const confirmed =
            confirm(
                "Are you sure you want to " +
                actionText +
                "?\n\n\"" +
                (
                    article.title ||
                    "Untitled Article"
                ) +
                "\""
            );


        if (!confirmed) {
            return;
        }


        const {
            error
        } = await supabaseClient
            .from("articles")
            .update({
                status: newStatus
            })
            .eq(
                "id",
                article.id
            );


        if (error) {

            console.error(
                "DΛMZΞΞ NEWS: Status update failed.",
                error
            );

            alert(
                "Unable to change article status.\n\n" +
                error.message
            );

            return;
        }


        if (newStatus === "published") {

            addActivity(
                "published",
                article.title,
                article.id
            );

            addNotification(
                "published",
                article.title
            );

            alert(
                "Article published successfully."
            );

        }

        else {

            addActivity(
                "draft",
                article.title,
                article.id
            );

            addNotification(
                "draft",
                article.title
            );

            alert(
                "Article moved to draft successfully."
            );
        }


        await refreshAdmin();
    }


    /* =========================================
       DISPLAY ARTICLES
    ========================================= */

    function displayArticles() {

        const allArticles =
            articlesCache;


        const searchTerm =
            articleSearch
                ? articleSearch.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedCategory =
            articleFilter
                ? articleFilter.value
                : "all";


        const selectedStatus =
            articleStatusFilter
                ? articleStatusFilter.value
                : "all";


        const articles =
            allArticles.filter(article => {

                const matchesSearch =
                    !searchTerm ||

                    (
                        article.title ||
                        ""
                    )
                        .toLowerCase()
                        .includes(searchTerm) ||

                    (
                        article.summary ||
                        ""
                    )
                        .toLowerCase()
                        .includes(searchTerm) ||

                    (
                        article.author ||
                        ""
                    )
                        .toLowerCase()
                        .includes(searchTerm);


                const matchesCategory =
                    selectedCategory === "all" ||
                    article.category ===
                        selectedCategory;


                const matchesStatus =
                    selectedStatus === "all" ||
                    article.status ===
                        selectedStatus;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesStatus
                );
            });


        if (totalArticles) {

            totalArticles.textContent =
                allArticles.length;
        }


        if (publishedArticles) {

            const publishedCount =
                allArticles.filter(
                    article =>
                        article.status !== "draft"
                ).length;


            publishedArticles.textContent =
                publishedCount;
        }


        if (!articlesList) {
            return;
        }


        articlesList.innerHTML = "";


        if (articles.length === 0) {

            const emptyState =
                document.createElement("div");

            emptyState.className =
                "empty-state";


            const emptyIcon =
                document.createElement("div");

            emptyIcon.className =
                "empty-icon";

            emptyIcon.textContent =
                "NEWS";


            const emptyTitle =
                document.createElement("h3");

            emptyTitle.textContent =
                searchTerm
                    ? "No matching articles"
                    : "No articles yet";


            const emptyText =
                document.createElement("p");

            emptyText.textContent =
                searchTerm
                    ? "Try another search term."
                    : "Articles will appear here.";


            emptyState.appendChild(
                emptyIcon
            );

            emptyState.appendChild(
                emptyTitle
            );

            emptyState.appendChild(
                emptyText
            );

            articlesList.appendChild(
                emptyState
            );

            return;
        }


        articles.forEach(article => {

            const item =
                document.createElement("article");

            item.className =
                "article-admin-item";


            /* THUMBNAIL */

            const thumbnail =
                document.createElement("img");

            thumbnail.className =
                "article-admin-thumbnail";


            thumbnail.src =
                getImageUrl(
                    article.image
                );


            thumbnail.alt =
                article.title ||
                "DΛMZΞΞ NEWS article";


            thumbnail.loading =
                "lazy";

            thumbnail.decoding =
                "async";

            thumbnail.referrerPolicy =
                "no-referrer";


            thumbnail.onerror =
                () => {

                    thumbnail.onerror =
                        null;

                    thumbnail.src =
                        fallbackImage;
                };


            if (article.image) {

                console.log(
                    "DΛMZΞΞ NEWS image:",
                    article.image
                );
            }


            /* INFORMATION */

            const information =
                document.createElement("div");

            information.style.flex =
                "1";

            information.style.minWidth =
                "0";


            const category =
                document.createElement("span");

            category.className =
                "eyebrow";

            category.textContent =
                article.category ||
                "NEWS";


            const title =
                document.createElement("h3");

            title.textContent =
                article.title ||
                "Untitled Article";


            const details =
                document.createElement("p");

            details.style.fontSize =
                "12px";

            details.style.color =
                "#788396";


            details.textContent =
                "By " +
                (
                    article.author ||
                    "DΛMZΞΞ NEWS"
                ) +
                " · " +
                (
                    article.date ||
                    ""
                ) +
                " · " +
                (
                    Number(
                        article.views
                    ) ||
                    0
                ) +
                " views";


            const statusBadge =
                document.createElement("span");


            statusBadge.style.display =
                "inline-flex";

            statusBadge.style.alignItems =
                "center";

            statusBadge.style.padding =
                "4px 9px";

            statusBadge.style.borderRadius =
                "20px";

            statusBadge.style.fontSize =
                "11px";

            statusBadge.style.fontWeight =
                "700";

            statusBadge.style.marginTop =
                "7px";


            if (
                article.status ===
                "draft"
            ) {

                statusBadge.textContent =
                    "DRAFT";

                statusBadge.style.background =
                    "#fff3cd";

                statusBadge.style.color =
                    "#856404";

            }

            else {

                statusBadge.textContent =
                    "PUBLISHED";

                statusBadge.style.background =
                    "#d1e7dd";

                statusBadge.style.color =
                    "#0f5132";
            }


            information.appendChild(
                category
            );

            information.appendChild(
                title
            );

            information.appendChild(
                details
            );

            information.appendChild(
                statusBadge
            );


            /* ACTIONS */

            const actions =
                document.createElement("div");

            actions.style.display =
                "flex";

            actions.style.gap =
                "8px";

            actions.style.flexWrap =
                "wrap";


            /* VIEW */

            const viewButton =
                document.createElement("button");

            viewButton.type =
                "button";

            viewButton.className =
                "secondary-button";

            viewButton.textContent =
                "View";


            viewButton.addEventListener(
                "click",
                () => {

                    const articleUrl =
                        getArticleUrl(
                            article.id
                        );

                    window.open(
                        articleUrl,
                        "_blank",
                        "noopener,noreferrer"
                    );
                }
            );


            /* COPY LINK */

            const copyLinkButton =
                document.createElement("button");

            copyLinkButton.type =
                "button";

            copyLinkButton.className =
                "secondary-button";

            copyLinkButton.textContent =
                "Copy Link";


            copyLinkButton.addEventListener(
                "click",
                async () => {

                    await copyArticleLink(
                        article.id,
                        copyLinkButton
                    );
                }
            );


            /* EDIT */

            const editButton =
                document.createElement("button");

            editButton.type =
                "button";

            editButton.className =
                "secondary-button";

            editButton.textContent =
                "Edit";


            editButton.addEventListener(
                "click",
                () => {

                    startEditing(
                        article
                    );
                }
            );


            /* STATUS */

            const statusButton =
                document.createElement("button");

            statusButton.type =
                "button";

            statusButton.className =
                "secondary-button";

            statusButton.textContent =
                article.status === "draft"
                    ? "Publish"
                    : "Move to Draft";


            statusButton.addEventListener(
                "click",
                () => {

                    changeArticleStatus(
                        article
                    );
                }
            );


            /* DELETE */

            const deleteButton =
                document.createElement("button");

            deleteButton.type =
                "button";

            deleteButton.className =
                "secondary-button";

            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                async () => {

                    const confirmed =
                        confirm(
                            "Are you sure you want to delete this article?"
                        );


                    if (!confirmed) {
                        return;
                    }


                    deleteButton.disabled =
                        true;

                    deleteButton.textContent =
                        "Deleting...";


                    const {
                        error
                    } = await supabaseClient
                        .from("articles")
                        .delete()
                        .eq(
                            "id",
                            article.id
                        );


                    if (error) {

                        console.error(
                            "DΛMZΞΞ NEWS: Delete failed.",
                            error
                        );

                        alert(
                            "Unable to delete article.\n\n" +
                            error.message
                        );

                        deleteButton.disabled =
                            false;

                        deleteButton.textContent =
                            "Delete";

                        return;
                    }


                    addActivity(
                        "deleted",
                        article.title,
                        article.id
                    );

                    addNotification(
                        "deleted",
                        article.title
                    );


                    alert(
                        "Article deleted successfully."
                    );


                    await refreshAdmin();
                }
            );


            actions.appendChild(
                viewButton
            );

            actions.appendChild(
                copyLinkButton
            );

            actions.appendChild(
                editButton
            );

            actions.appendChild(
                statusButton
            );

            actions.appendChild(
                deleteButton
            );


            item.appendChild(
                thumbnail
            );

            item.appendChild(
                information
            );

            item.appendChild(
                actions
            );


            articlesList.appendChild(
                item
            );
        });
    }


    /* =========================================
       START EDITING
    ========================================= */

    function startEditing(article) {

        if (!articleForm) {
            return;
        }


        editingArticleId =
            article.id;


        existingArticleImage =
            article.image ||
            "";


        const titleInput =
            document.getElementById(
                "articleTitle"
            );

        const categoryInput =
            document.getElementById(
                "articleCategory"
            );

        const authorInput =
            document.getElementById(
                "articleAuthor"
            );

        const summaryInput =
            document.getElementById(
                "articleSummary"
            );

        const contentInput =
            document.getElementById(
                "articleContent"
            );


        if (titleInput) {

            titleInput.value =
                article.title ||
                "";
        }


        if (categoryInput) {

            categoryInput.value =
                article.category ||
                "";
        }


        if (authorInput) {

            authorInput.value =
                article.author ||
                "DΛMZΞΞ NEWS";
        }


        if (articleStatus) {

            articleStatus.value =
                article.status === "draft"
                    ? "draft"
                    : "published";
        }


        if (articleBreaking) {

            articleBreaking.value =
                article.breaking === "yes"
                    ? "yes"
                    : "no";
        }


        if (articleImageFile) {

            articleImageFile.value =
                "";
        }


        if (
            article.image &&
            imagePreview &&
            imagePreviewContainer
        ) {

            imagePreview.src =
                getImageUrl(
                    article.image
                );

            imagePreviewContainer.style.display =
                "block";

            if (imageUploadStatus) {

                imageUploadStatus.textContent =
                    "Current image loaded. Choose a new image to replace it.";
            }

        }

        else {

            clearImageSelection();
        }


        if (summaryInput) {

            summaryInput.value =
                article.summary ||
                "";
        }


        if (contentInput) {

            contentInput.value =
                article.content ||
                "";
        }


        const submitButton =
            articleForm.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.textContent =
                "Update Article";
        }


        const panelHeading =
            document.querySelector(
                "#new-article .panel-header h2"
            );


        if (panelHeading) {

            panelHeading.textContent =
                "Edit Article";
        }


        const newArticleSection =
            document.getElementById(
                "new-article"
            );


        if (newArticleSection) {

            newArticleSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }


    /* =========================================
       SAVE ARTICLE
    ========================================= */

    if (articleForm) {

        articleForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const titleInput =
                    document.getElementById(
                        "articleTitle"
                    );

                const categoryInput =
                    document.getElementById(
                        "articleCategory"
                    );

                const authorInput =
                    document.getElementById(
                        "articleAuthor"
                    );

                const summaryInput =
                    document.getElementById(
                        "articleSummary"
                    );

                const contentInput =
                    document.getElementById(
                        "articleContent"
                    );


                const title =
                    titleInput
                        ? titleInput.value.trim()
                        : "";


                const category =
                    categoryInput
                        ? categoryInput.value
                        : "";


                const author =
                    authorInput
                        ? authorInput.value.trim()
                        : "";


                const summary =
                    summaryInput
                        ? summaryInput.value.trim()
                        : "";


                const content =
                    contentInput
                        ? contentInput.value.trim()
                        : "";


                const status =
                    articleStatus
                        ? articleStatus.value
                        : "published";


                const breaking =
                    articleBreaking
                        ? articleBreaking.value
                        : "no";


                const selectedImage =
                    articleImageFile &&
                    articleImageFile.files &&
                    articleImageFile.files[0]
                        ? articleImageFile.files[0]
                        : null;


                if (
                    !title ||
                    !category ||
                    !author ||
                    !summary ||
                    !content
                ) {

                    alert(
                        "Please complete all required fields."
                    );

                    return;
                }


                if (
                    editingArticleId === null &&
                    !selectedImage
                ) {

                    alert(
                        "Please choose an article image."
                    );

                    return;
                }


                const submitButton =
                    articleForm.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        selectedImage
                            ? "Preparing image..."
                            : "Saving...";
                }


                try {

                    let image =
                        existingArticleImage ||
                        "";


                    if (selectedImage) {

                        image =
                            await uploadArticleImage(
                                selectedImage
                            );
                    }


                    /* UPDATE */

                    if (
                        editingArticleId !== null
                    ) {

                        const existingArticle =
                            articlesCache.find(
                                article =>
                                    String(
                                        article.id
                                    ) ===
                                    String(
                                        editingArticleId
                                    )
                            );


                        const oldStatus =
                            existingArticle &&
                            existingArticle.status ===
                                "draft"
                                ? "draft"
                                : "published";


                        const {
                            error
                        } = await supabaseClient
                            .from("articles")
                            .update({

                                title:
                                    title,

                                category:
                                    category,

                                author:
                                    author,

                                image:
                                    image,

                                summary:
                                    summary,

                                content:
                                    content,

                                status:
                                    status,

                                breaking:
                                    breaking

                            })
                            .eq(
                                "id",
                                editingArticleId
                            );


                        if (error) {

                            console.error(
                                "DΛMZΞΞ NEWS: Article update failed.",
                                error
                            );

                            alert(
                                "Unable to update article.\n\n" +
                                error.message
                            );

                        }

                        else {

                            if (
                                oldStatus ===
                                    "draft" &&
                                status ===
                                    "published"
                            ) {

                                addActivity(
                                    "published",
                                    title,
                                    editingArticleId
                                );

                                addNotification(
                                    "published",
                                    title
                                );

                            }

                            else if (
                                oldStatus ===
                                    "published" &&
                                status ===
                                    "draft"
                            ) {

                                addActivity(
                                    "draft",
                                    title,
                                    editingArticleId
                                );

                                addNotification(
                                    "draft",
                                    title
                                );

                            }

                            else {

                                addActivity(
                                    "updated",
                                    title,
                                    editingArticleId
                                );

                                addNotification(
                                    "updated",
                                    title
                                );
                            }


                            alert(
                                status === "draft"
                                    ? "Draft saved successfully."
                                    : "Article updated successfully."
                            );


                            resetArticleForm();

                            await refreshAdmin();
                        }
                    }


                    /* CREATE */

                    else {

                        const {
                            data,
                            error
                        } = await supabaseClient
                            .from("articles")
                            .insert({

                                title:
                                    title,

                                category:
                                    category,

                                author:
                                    author,

                                image:
                                    image,

                                summary:
                                    summary,

                                content:
                                    content,

                                views:
                                    0,

                                status:
                                    status,

                                breaking:
                                    breaking,

                                date:
                                    new Date()
                                        .toLocaleDateString(
                                            "en-GB",
                                            {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                            }
                                        )

                            })
                            .select()
                            .single();


                        if (error) {

                            console.error(
                                "DΛMZΞΞ NEWS: Article creation failed.",
                                error
                            );

                            alert(
                                "Unable to save article.\n\n" +
                                error.message
                            );

                        }

                        else {

                            const newArticle =
                                data;


                            if (
                                status ===
                                "draft"
                            ) {

                                addActivity(
                                    "draft",
                                    title,
                                    newArticle.id
                                );

                                addNotification(
                                    "draft",
                                    title
                                );

                                alert(
                                    "Draft saved successfully."
                                );

                            }

                            else {

                                addActivity(
                                    "published",
                                    title,
                                    newArticle.id
                                );

                                addNotification(
                                    "published",
                                    title
                                );

                                alert(
                                    "Article published successfully."
                                );
                            }


                            resetArticleForm();

                            await refreshAdmin();
                        }
                    }

                }

                catch (error) {

                    console.error(
                        "DΛMZΞΞ NEWS: Unexpected save error.",
                        error
                    );

                    alert(
                        "Something went wrong.\n\n" +
                        error.message
                    );

                }

                finally {

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            editingArticleId !== null
                                ? "Update Article"
                                : "Save Article";
                    }
                }
            }
        );
    }


    /* =========================================
       CLEAR FORM
    ========================================= */

    if (
        clearForm &&
        articleForm
    ) {

        clearForm.addEventListener(
            "click",
            () => {

                resetArticleForm();
            }
        );
    }


    /* =========================================
       ARTICLE SEARCH
    ========================================= */

    if (articleSearch) {

        articleSearch.addEventListener(
            "input",
            () => {

                displayArticles();
            }
        );
    }


    /* =========================================
       CATEGORY FILTER
    ========================================= */

    if (articleFilter) {

        articleFilter.addEventListener(
            "change",
            () => {

                displayArticles();
            }
        );
    }


    /* =========================================
       STATUS FILTER
    ========================================= */

    if (articleStatusFilter) {

        articleStatusFilter.addEventListener(
            "change",
            () => {

                displayArticles();
            }
        );
    }


    /* =========================================
       NEWSLETTER
    ========================================= */

    async function loadNewsletterSubscribers() {

        if (
            !subscriberCount ||
            !subscriberList
        ) {
            return;
        }


        let subscriberControls =
            document.getElementById(
                "subscriberControls"
            );


        if (!subscriberControls) {

            subscriberControls =
                document.createElement("div");

            subscriberControls.id =
                "subscriberControls";

            subscriberControls.style.marginBottom =
                "18px";


            const searchInput =
                document.createElement("input");

            searchInput.type =
                "search";

            searchInput.id =
                "subscriberSearch";

            searchInput.placeholder =
                "Search subscribers by email...";

            searchInput.setAttribute(
                "aria-label",
                "Search newsletter subscribers"
            );

            searchInput.style.width =
                "100%";

            searchInput.style.padding =
                "12px 14px";

            searchInput.style.border =
                "1px solid #dfe5ec";

            searchInput.style.borderRadius =
                "8px";

            searchInput.style.fontSize =
                "13px";

            searchInput.style.outline =
                "none";

            searchInput.style.boxSizing =
                "border-box";


            searchInput.addEventListener(
                "input",
                () => {

                    subscriberSearchTerm =
                        searchInput.value
                            .trim()
                            .toLowerCase();

                    subscriberPage =
                        1;

                    loadNewsletterSubscribers();
                }
            );


            subscriberControls.appendChild(
                searchInput
            );


            if (
                subscriberList.parentElement
            ) {

                subscriberList.parentElement.insertBefore(
                    subscriberControls,
                    subscriberList
                );
            }
        }


        subscriberList.innerHTML = `
            <div class="empty-subscribers">
                <p>Loading subscribers...</p>
            </div>
        `;


        try {

            let query =
                supabaseClient
                    .from(
                        "newsletter_subscribers"
                    )
                    .select(
                        "id, email, subscribed_at, active",
                        {
                            count: "exact"
                        }
                    )
                    .eq(
                        "active",
                        true
                    );


            if (subscriberSearchTerm) {

                query =
                    query.ilike(
                        "email",
                        "%" +
                        subscriberSearchTerm +
                        "%"
                    );
            }


            const start =
                (
                    subscriberPage -
                    1
                ) *
                subscribersPerPage;


            const end =
                start +
                subscribersPerPage -
                1;


            const {
                data,
                error,
                count
            } = await query
                .order(
                    "subscribed_at",
                    {
                        ascending: false
                    }
                )
                .range(
                    start,
                    end
                );


            if (error) {

                console.error(
                    "DΛMZΞΞ NEWS: Unable to load newsletter subscribers.",
                    error
                );

                subscriberCount.textContent =
                    "0";

                subscriberList.innerHTML = `
                    <div class="empty-subscribers">
                        <p>Unable to load subscribers.</p>
                    </div>
                `;

                return;
            }


            const totalSubscribers =
                Number(count) ||
                0;


            subscriberCount.textContent =
                totalSubscribers.toLocaleString();


            if (
                totalSubscribers ===
                0
            ) {

                subscriberList.innerHTML = `
                    <div class="empty-subscribers">
                        <p>${
                            subscriberSearchTerm
                                ? "No subscribers found."
                                : "No subscribers yet."
                        }</p>
                    </div>
                `;

                return;
            }


            subscriberList.innerHTML =
                "";


            const subscribers =
                Array.isArray(data)
                    ? data
                    : [];


            subscribers.forEach(
                subscriber => {

                    const row =
                        document.createElement(
                            "div"
                        );

                    row.className =
                        "subscriber-row";


                    const information =
                        document.createElement(
                            "div"
                        );

                    information.className =
                        "subscriber-info";


                    const email =
                        document.createElement(
                            "strong"
                        );

                    email.textContent =
                        subscriber.email;


                    const date =
                        document.createElement(
                            "small"
                        );


                    if (
                        subscriber.subscribed_at
                    ) {

                        date.textContent =
                            "Subscribed: " +
                            new Date(
                                subscriber.subscribed_at
                            ).toLocaleString(
                                "en-GB",
                                {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                }
                            );

                    }

                    else {

                        date.textContent =
                            "Subscription date unavailable";
                    }


                    const deleteButton =
                        document.createElement(
                            "button"
                        );

                    deleteButton.type =
                        "button";

                    deleteButton.className =
                        "secondary-button";

                    deleteButton.textContent =
                        "Delete";


                    deleteButton.addEventListener(
                        "click",
                        async () => {

                            const confirmed =
                                confirm(
                                    "Remove " +
                                    subscriber.email +
                                    " from newsletter subscribers?"
                                );


                            if (!confirmed) {
                                return;
                            }


                            deleteButton.disabled =
                                true;

                            deleteButton.textContent =
                                "Deleting...";


                            const {
                                error
                            } =
                                await supabaseClient
                                    .from(
                                        "newsletter_subscribers"
                                    )
                                    .delete()
                                    .eq(
                                        "id",
                                        subscriber.id
                                    );


                            if (error) {

                                console.error(
                                    "DΛMZΞΞ NEWS: Unable to delete subscriber.",
                                    error
                                );

                                alert(
                                    "Unable to delete subscriber.\n\n" +
                                    error.message
                                );

                                deleteButton.disabled =
                                    false;

                                deleteButton.textContent =
                                    "Delete";

                                return;
                            }


                            const remainingOnPage =
                                subscribers.length -
                                1;


                            if (
                                remainingOnPage ===
                                    0 &&
                                subscriberPage >
                                    1
                            ) {

                                subscriberPage--;
                            }


                            await loadNewsletterSubscribers();
                        }
                    );


                    information.appendChild(
                        email
                    );

                    information.appendChild(
                        date
                    );

                    row.appendChild(
                        information
                    );

                    row.appendChild(
                        deleteButton
                    );

                    subscriberList.appendChild(
                        row
                    );
                }
            );


            const totalPages =
                Math.ceil(
                    totalSubscribers /
                    subscribersPerPage
                );


            const oldPagination =
                document.getElementById(
                    "subscriberPagination"
                );


            if (oldPagination) {

                oldPagination.remove();
            }


            if (totalPages > 1) {

                const pagination =
                    document.createElement(
                        "div"
                    );

                pagination.id =
                    "subscriberPagination";

                pagination.style.display =
                    "flex";

                pagination.style.alignItems =
                    "center";

                pagination.style.justifyContent =
                    "center";

                pagination.style.gap =
                    "12px";

                pagination.style.marginTop =
                    "20px";

                pagination.style.flexWrap =
                    "wrap";


                const previousButton =
                    document.createElement(
                        "button"
                    );

                previousButton.type =
                    "button";

                previousButton.className =
                    "secondary-button";

                previousButton.textContent =
                    "← Previous";

                previousButton.disabled =
                    subscriberPage === 1;


                previousButton.addEventListener(
                    "click",
                    () => {

                        if (
                            subscriberPage <=
                            1
                        ) {
                            return;
                        }

                        subscriberPage--;

                        loadNewsletterSubscribers();
                    }
                );


                const pageText =
                    document.createElement(
                        "span"
                    );

                pageText.textContent =
                    "Page " +
                    subscriberPage +
                    " of " +
                    totalPages;

                pageText.style.fontSize =
                    "13px";

                pageText.style.color =
                    "#788396";

                pageText.style.fontWeight =
                    "600";


                const nextButton =
                    document.createElement(
                        "button"
                    );

                nextButton.type =
                    "button";

                nextButton.className =
                    "secondary-button";

                nextButton.textContent =
                    "Next →";

                nextButton.disabled =
                    subscriberPage >=
                    totalPages;


                nextButton.addEventListener(
                    "click",
                    () => {

                        if (
                            subscriberPage >=
                            totalPages
                        ) {
                            return;
                        }

                        subscriberPage++;

                        loadNewsletterSubscribers();
                    }
                );


                pagination.appendChild(
                    previousButton
                );

                pagination.appendChild(
                    pageText
                );

                pagination.appendChild(
                    nextButton
                );


                if (
                    subscriberList.parentElement
                ) {

                    subscriberList.parentElement.appendChild(
                        pagination
                    );
                }
            }

        }

        catch (error) {

            console.error(
                "DΛMZΞΞ NEWS: Newsletter subscriber error.",
                error
            );

            subscriberCount.textContent =
                "0";

            subscriberList.innerHTML = `
                <div class="empty-subscribers">
                    <p>Unable to load subscribers.</p>
                </div>
            `;
        }
    }


    /* =========================================
       REFRESH ADMIN
    ========================================= */

    async function refreshAdmin() {

        const articles =
            await getArticles();


        if (!Array.isArray(articles)) {
            return;
        }


        displayArticles();

        updateTotalViews();

        updateViewsChart();

        updateCategoryChart();

        updateActivityList();

        updateNotifications();

        updateSystemStatus();

        await loadNewsletterSubscribers();
    }


    /* =========================================
       START ADMIN
    ========================================= */

    refreshAdmin();


    console.log(
        "DΛMZΞΞ NEWS admin connected to Supabase."
    );

});