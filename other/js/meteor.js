/*************演示流星的函数***********************/
function createMeteor(options) {
	var cav = options.canvas.element;
	var context = cav.getContext("2d");
	cav.width = options.canvas.width;
	cav.height = options.canvas.height;


	var Meteors = [];
	var MeteorCount = options.canvas.num;

	var Sin = [], Cos = [];
	var i;

	// 缓存三角函数
	for (i=0; i<181; i++) {
		Sin[i] = Math.sin(i*3.14/180);
		Cos[i] = Math.cos(i*3.14/180);
	}
	
	function Meteor (options) {

		//流星的坐标、长度、宽度、速度和透明度、角度
		this.x = options.x || 1000;
		this.y = options.y || 100;
		this.length = options.length < 1 ? 80 : options.length;
		this.width = options.width < 1 ? 3 : options.width;
		this.speed = options.speed < 1 ? 10 : options.speed;
		this.alpha = options.alpha || 1; 
		this.angle = options.angle < 1 ? 30 : options.angle%180 >> 0;
			

		// 流星终止条件
		this.end = {
			y: options.end.y || 320,
			alpha: options.end.alpha || 0.01
		};
		
		// 流星在给予的角度内发散条件
		this.random = options.random || false;
		
		//流星的色彩
		this.color1 = "";
		this.color2 = "";  
	}


	Meteor.prototype = {

		/**************获取随机颜色函数*****************/
	    setColor: function ()  {
	    	var color = ((Math.random() * 0xF0F0F0) >> 0).toString(16);
	    	while (color.length < 6) {
	    		color = "0" + color;
	    	}

	        this.color1 = "#" + color;
	       
	        this.color2 = "black";
	    },


		/*****************初始化参数*****************/
	    set: function () {

           	this.x = Math.random() * this.x + 100 * Cos[this.angle] >> 0;

           	this.y = Math.random() * this.y >> 0;
          	
           	this.length = Math.random() * this.length + 120 >> 0;
           

			// 流星宽度
           	this.width = this.width * Math.random() >> 0 || 3;  

           	// 流星倾斜角
           	this.angle = this.random ? Math.random() * this.angle >> 0 : this.angle; 
           	// 流星的速度
	        this.speed = this.speed * Math.random() >> 0 || 2; 

	        this.alpha = this.alpha;
	    },

		/***************重新计算流星坐标******************/
        countPos: function ()  {
           	this.x = this.x - this.speed * Cos[this.angle];
           	this.y = this.y + this.speed * Sin[this.angle];
        },

		/****绘制单个流星***************************/
        drawSingleMeteor: function () {
          	var gradient;

			context.save();
			context.beginPath();
			context.lineWidth = this.width;

			// 设置透明度
			context.globalAlpha = this.alpha; 

			gradient = context.createLinearGradient(this.x,
										               this.y,
										                this.x + this.length * Cos[this.angle],
										                 this.y - this.length * Sin[this.angle]); 
								                 
			// 流星的渐变颜色
			gradient.addColorStop(0, "white");
			gradient.addColorStop(0.1, this.color1);
			gradient.addColorStop(0.7, this.color2);

			context.strokeStyle = gradient;
			context.fillStyle = 'white';

			// 绘制流星头部
			context.arc(this.x, this.y, this.width / 8, 90-this.angle, 270-this.angle, false);

			// 绘制流星主体
			context.moveTo(this.x, this.y);
			context.lineTo(this.x + this.length * Cos[this.angle], 
							this.y - this.length * Sin[this.angle]);

			// 上述两次绘制顺序不可颠倒,否则你可以看到奇怪的东西
			 
			// 描边，填充
			context.fill();
			context.stroke();
			
			context.closePath();
			context.restore();
		},

    	/****************初始化函数********************/
        init: function () {

            this.set();
            this.setColor();
        }
	};

	//流星
	function playMeteors() {
	    for (var i = 0; i < MeteorCount; i++) {

	    	// 流星速度矢量 
	        var Vx = Meteors[i].speed * Cos[Meteors[i].angle];
	        var Vy = Meteors[i].speed * Sin[Meteors[i].angle];

	        // 修正流星宽度可能带来的影响
	        var Wx = (Meteors[i].width * Sin[Meteors[i].angle] * (Cos[Meteors[i].angle] < 0 ? -1 : 1))/2;
	        var Wy = Meteors[i].width * ( 1 - Sin[Meteors[i].angle])/2;

	        var WmaxX = (Meteors[i].width * (Cos[Meteors[i].angle] < 0 ? -1 : 1));
	        var WmaxY = Meteors[i].width;

	        // 清除流星小尾巴
	        context.clearRect(Meteors[i].x + Meteors[i].length * Cos[Meteors[i].angle] - 6 * (Vx + Wx),
					        	Meteors[i].y-Meteors[i].length * Sin[Meteors[i].angle] - 6 * (Vy + Wy),
					        		10 * (Vx + Wx),
					        			10 * (Vy + Wy));

	        Meteors[i].countPos();
	        Meteors[i].drawSingleMeteor();
	        
	        Meteors[i].alpha -= 0.002;
	        
	        //终止条件
	        if (Meteors[i].y > Meteors[i].end.y || 
	        	   Meteors[i].alpha <= Meteors[i].end.alpha) {
	            context.clearRect(Meteors[i].x -  WmaxX , 
					            	Meteors[i].y - Meteors[i].length * Sin[Meteors[i].angle] - WmaxY, 
					            		Meteors[i].length * Cos[Meteors[i].angle] + 2 * WmaxX , 
					            			Meteors[i].length * Sin[Meteors[i].angle] + 2 * WmaxY);
	            // 重新生成流星
	            Meteors[i] = new Meteor(options.meteor);
	            Meteors[i].init();
	        } 
	    }
	}
	
	for ( i = 0; i < MeteorCount; i++) {
      	Meteors[i] = new Meteor(options.meteor);
       	Meteors[i].init();
   	}
	setInterval(playMeteors, 30);
}