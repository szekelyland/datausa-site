viz.loadBuilds = function(builds) {

  if (builds.length) {

    builds.forEach(function(build, i){
      build.container = d3.select(d3.selectAll(".viz")[0][i]);
      build.loaded = false;
      build.timer = false;
      build.index = i;
      build.colors = vizStyles[attr_type];

      var select = d3.select(build.container.node().parentNode).select("select");
      if (select.size()) {

        d3plus.form()
          .search(false)
          .ui({
            "margin": 0
          })
          .focus({"callback": function(id){

            var param = this.getAttribute("data-param"),
                method = this.getAttribute("data-method"),
                prev = this.getAttribute("data-default");

            if (id !== prev) {

              d3.select(this).attr("data-default", id);

              d3.select(this.parentNode).selectAll(".select-text")
               .html(d3.select(this).select("option[value='"+ id +"']").text());

              d3.select(this.parentNode).selectAll(".stat-value span[data-url]")
               .each(function(){

                 d3.select(this.parentNode).classed("loading", true);
                 var url = this.getAttribute("data-url");
                 if (param.length) {
                   url = url.replace(param + "=" + prev, param + "=" + id);
                 }
                 else {
                   url = url.replace("order=" + prev, "order=" + id);
                   url = url.replace("required=" + prev, "required=" + id);
                 }
                 d3.select(this).attr("data-url", url);

                 load(url, function(data){
                   d3.select(this.parentNode).classed("loading", false)
                   d3.select(this).html(data.value);
                 }.bind(this));

               });

              if (param.length) {
               build.data.forEach(function(b){
                 b.url = b.url.replace(param + "=" + prev, param + "=" + id);
               });
               viz.loadData(build, "redraw");
              }
              else if (method.length) {
               build.viz[method](id).draw();
              }

            }

          }.bind(select.node())})
          .data(select)
          .width(select.node().parentNode.offsetWidth)
          .type("drop")
          .draw();

      }

    });

    function resizeApps() {

      builds.forEach(function(b, i){
        b.top = b.container.node().offsetTop;
        b.height = b.container.node().offsetHeight;
      });

    }
    resizeApps();
    resizeFunctions.push(resizeApps);

    var scrollBuffer = -200, n = [32], app;
    function buildInView(b) {
      var top = window.scrollY, height = window.innerHeight;
      return top+height > b.top+scrollBuffer && top+scrollBuffer < b.top+b.height;
    }

    function buildScroll(ms) {
      if (ms === undefined) ms = 0;
      for (var i = 0; i < builds.length; i++) {
        var b = builds[i];
        if (!b.timer && !b.loaded) {
          if (buildInView(b)) {
            b.timer = setTimeout(function(build){
              clearTimeout(build.timer);
              build.timer = false;
              if (buildInView(build)) {
              // if (buildInView(build) && n.indexOf(build.index) >= 0) {
                app = viz(build);
                build.loaded = true;
              }
            }, ms, b);
          }
        }
      }
    }

    buildScroll();
    scrollFunctions.push(buildScroll);

  }

}
