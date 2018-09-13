var exec = require('child_process').exec;
const path = require('path');

var STARTUP_HOUR = 08;
var STARTUP_MIN  = 30;

var SHUTDOWN_HOUR   = 17;
var SHUTDOWN_MINUTE = 30;

// which days the machine should be on for
var ACTIVE_DAYS = [ false, // SUNDAY
                    true, // MONDAY
                    true,
                    true,
                    true,
                    true, // FRIDAY
                    false ];


module.exports.init = function(onshutdown) {
  //clear any previously scheduled startups
  exec('crontab -r', function(err, stdout, stderr) {});

  //calculate the next time we should shut down
  let shutdownTime = calcShutdownTime();
  let shutdownInterval = shutdownTime - Math.floor(Date.now() / 1000);

  console.log("Initialising server... current system time is " + new Date(Date.now()).toString());
  console.log("The next automatic shut down will be " + new Date(shutdownTime*1000).toString());

  /*setTimeout(function() {
    console.log("Automatic shutdown procedure started...");
    onshutdown(function(done) {
      performShutdown();
    });
  }, (shutdownInterval+1) * 1000);*/
};

var ROOT_DIR = path.normalize(__dirname + '/..');

function performShutdown()
{
  let rebootTime = new Date(calcRebootTime() * 1000);

  console.log("Putting the machine to sleep until " + rebootTime.toString() + "...");
  let cmd = './server-stop.sh "' + rebootTime.getUTCMinutes() + ' ' + rebootTime.getUTCHours() + ' ' + rebootTime.getUTCDate() + ' ' + (rebootTime.getUTCMonth()+1) + ' *"';
  console.log("$ " + cmd);

  exec(cmd, function(err, stdout, stderr) {
    console.log(stdout.toString('utf8'));
    console.log(stderr.toString('utf8'));
    process.exit(0);
  });
}

// return values as UNIX timestamps
function calcRebootTime()
{
  let time = CalcTimeUntil(new Date(Date.now()), STARTUP_HOUR, STARTUP_MIN);

  //walk along the days of the week until we find one that we should be active on
  // using a for loop here in case someone sets all days to be inactive
  for(let i = 0; i < 7; i++)
  {
    if(!ACTIVE_DAYS[new Date(time*1000).getDay()])
    {
      time += 24*60*60;
    }
    else
      break;
  }

  return time;
}

function calcShutdownTime()
{
  let now = new Date(Date.now());

  return CalcTimeUntil(now, SHUTDOWN_HOUR, SHUTDOWN_MINUTE);
}

// reutrns the unix timae after the date object passed in to the minutes and seconds specified
function CalcTimeUntil(now, targetHour, targetMinute)
{
  let time = Math.floor(now.getTime() / 1000);

  let hour = now.getHours();
  let minute = now.getMinutes();

  if(minute > targetMinute)
  {
    time += (targetMinute + (60 - minute)) * 60;

    hour++;
    if(hour > 23) hour = hour - 24;
  }
  else
  {
    time += (targetMinute - minute) * 60;
  }

  if(hour > targetHour)
  {
    time += (targetHour + (24 - hour)) * (60 * 60);
  }
  else
  {
    time += (targetHour - hour) * (60 * 60);
  }

  return time;
}
